from . import app
from flask import jsonify, request, redirect
import json
import os
from urllib.parse import urlencode
import requests
import pymysql
import joblib

from app.services.speech_to_text import process_audio_file
from app.services.bank_lookup import check_bank_account

# ==========================================
# LOAD OAUTH CONFIG
# ==========================================
with open(os.path.join(os.path.dirname(__file__), '..', 'config.json')) as f:
    oauth_config = json.load(f)

FRONTEND_HOME_URL = oauth_config.get("FRONTEND_HOME_URL", "http://localhost:5173/")


# ==========================================
# USER LOGIN / REGISTER HELPER
# ==========================================
def load_valid_users():
    users_path = os.path.join(os.path.dirname(__file__), '..', 'valid_users.json')
    with open(users_path, encoding="utf-8") as f:
        return json.load(f)


def save_valid_users(users):
    users_path = os.path.join(os.path.dirname(__file__), '..', 'valid_users.json')
    with open(users_path, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


# ==========================================
# AUTH ROUTES
# ==========================================
@app.route("/api/auth/login", methods=["POST"])
def email_password_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    if not password or (not email and not username):
        return jsonify({"error": "email/username and password are required"}), 400

    valid_users = load_valid_users()
    matched_user = None

    for user in valid_users:
        user_email = (user.get("email") or "").strip().lower()
        user_username = (user.get("username") or "").strip().lower()
        user_password = user.get("password") or ""

        identity_match = (email and email == user_email) or (username and username == user_username)
        if identity_match and password == user_password:
            matched_user = {
                "id": user.get("id"),
                "username": user.get("username"),
                "email": user.get("email")
            }
            break

    if not matched_user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user": matched_user
    })


@app.route("/api/auth/register", methods=["POST"])
def email_password_register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400

    valid_users = load_valid_users()

    for user in valid_users:
        existing_email = (user.get("email") or "").strip().lower()
        if email == existing_email:
            return jsonify({"error": "Email already exists"}), 409

    next_id = max((user.get("id", 0) for user in valid_users), default=0) + 1
    new_user = {
        "id": next_id,
        "username": username,
        "email": email,
        "password": password
    }

    valid_users.append(new_user)
    save_valid_users(valid_users)

    return jsonify({
        "message": "Registration successful",
        "user": {
            "id": new_user["id"],
            "username": new_user["username"],
            "email": new_user["email"]
        }
    }), 201


@app.route("/api/auth/google/login")
def google_login():
    params = {
        "client_id": oauth_config["GOOGLE_CLIENT_ID"],
        "redirect_uri": oauth_config["GOOGLE_REDIRECT_URI"],
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return redirect(url)


@app.route("/api/auth/google/callback")
def google_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing code"}), 400

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": oauth_config["GOOGLE_CLIENT_ID"],
        "client_secret": oauth_config["GOOGLE_CLIENT_SECRET"],
        "redirect_uri": oauth_config["GOOGLE_REDIRECT_URI"],
        "grant_type": "authorization_code"
    }

    token_resp = requests.post(token_url, data=data)
    token_json = token_resp.json()
    access_token = token_json.get("access_token")

    if not access_token:
        return jsonify({"error": "Failed to obtain access token", "details": token_json}), 400

    return redirect(FRONTEND_HOME_URL)


@app.route("/api/auth/facebook/login")
def facebook_login():
    params = {
        "client_id": oauth_config["FACEBOOK_CLIENT_ID"],
        "redirect_uri": oauth_config["FACEBOOK_REDIRECT_URI"],
        "state": "random_state_string",
        "scope": "email,public_profile"
    }
    url = f"https://www.facebook.com/v17.0/dialog/oauth?{urlencode(params)}"
    return redirect(url)


@app.route("/api/auth/facebook/callback")
def facebook_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing code"}), 400

    token_url = "https://graph.facebook.com/v17.0/oauth/access_token"
    params = {
        "client_id": oauth_config["FACEBOOK_CLIENT_ID"],
        "redirect_uri": oauth_config["FACEBOOK_REDIRECT_URI"],
        "client_secret": oauth_config["FACEBOOK_CLIENT_SECRET"],
        "code": code
    }

    token_resp = requests.get(token_url, params=params)
    token_json = token_resp.json()
    access_token = token_json.get("access_token")

    if not access_token:
        return jsonify({"error": "Failed to obtain access token", "details": token_json}), 400

    return redirect(FRONTEND_HOME_URL)


# ==========================================
# BASIC ROUTES
# ==========================================
@app.route("/")
def home():
    return jsonify({
        "message": "Scam Prevention Backend is running!"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok"
    })


# ==========================================
# LOAD AI MODEL
# ==========================================
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models_saved', 'scam_model.pkl')

try:
    scam_model = joblib.load(MODEL_PATH)
    print("Đã tải thành công AI Model!")
except Exception as e:
    scam_model = None
    print(f"Lỗi tải AI Model: {str(e)}. Hệ thống sẽ dùng từ khóa mặc định.")


# ==========================================
# TEXT SCAM DETECTION
# ==========================================
@app.route("/api/detect-text", methods=["POST"])
def detect_text():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")

    if not text.strip():
        return jsonify({
            "input_text": text,
            "is_scam": False,
            "message": "Vui lòng nhập nội dung."
        })

    is_scam = False

    if scam_model:
        prediction = scam_model.predict([text])[0]
        is_scam = bool(prediction == 1)
    else:
        suspicious_keywords = ["otp", "chuyển khoản", "trúng thưởng", "click link", "xác minh tài khoản"]
        is_scam = any(keyword.lower() in text.lower() for keyword in suspicious_keywords)

    return jsonify({
        "input_text": text,
        "is_scam": is_scam,
        "message": "Phát hiện nội dung có dấu hiệu lừa đảo!" if is_scam else "Văn bản an toàn, không có dấu hiệu lừa đảo."
    })


# ==========================================
# DATABASE CONNECTION
# ==========================================
def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='12345',
        database='scam_prevention_db',
        cursorclass=pymysql.cursors.DictCursor
    )


# ==========================================
# WARNINGS API (DATABASE)
# ==========================================
@app.route("/api/warnings", methods=["GET", "POST"])
def handle_warnings():
    connection = None
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            if request.method == "POST":
                data = request.get_json(silent=True) or {}
                title = data.get("title")
                content = data.get("content")
                risk_level = data.get("risk_level", "High")

                sql = "INSERT INTO warnings (title, content, risk_level) VALUES (%s, %s, %s)"
                cursor.execute(sql, (title, content, risk_level))
                connection.commit()

                return jsonify({
                    "status": "success",
                    "message": "Đã lưu cảnh báo vào cơ sở dữ liệu!"
                }), 201

            elif request.method == "GET":
                sql = "SELECT id, title, content, risk_level, created_at FROM warnings ORDER BY created_at DESC"
                cursor.execute(sql)
                warnings = cursor.fetchall()

                for w in warnings:
                    if w['created_at']:
                        w['created_at'] = w['created_at'].strftime("%Y-%m-%d %H:%M:%S")

                return jsonify({
                    "status": "success",
                    "data": warnings
                }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Lỗi Database: {str(e)}"
        }), 500

    finally:
        if connection and connection.open:
            connection.close()


# ==========================================
# AUDIO CHECK API (NO DATABASE)
# ==========================================
# ==========================================
# AUDIO CHECK API (NO DATABASE)
# ==========================================
@app.route("/api/check-audio", methods=["POST"])
def check_audio():
    try:
        if "audio" not in request.files:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy file audio trong request"
            }), 400

        audio_file = request.files["audio"]
        result = process_audio_file(audio_file)

        if not result["success"]:
            return jsonify(result), 400

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi server: {str(e)}"
        }), 500


# ==========================================
# BANK ACCOUNT CHECK API (NO DATABASE)
# ==========================================
@app.route("/api/check-bank-account", methods=["POST"])
def check_bank_account_api():
    try:
        data = request.get_json(silent=True) or {}

        if not data:
            return jsonify({
                "success": False,
                "message": "Không nhận được dữ liệu JSON"
            }), 400

        bank_name = data.get("bank_name", "").strip()
        account_number = data.get("account_number", "").strip()

        if not bank_name or not account_number:
            return jsonify({
                "success": False,
                "message": "Thiếu bank_name hoặc account_number"
            }), 400

        result = check_bank_account(bank_name, account_number)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi server: {str(e)}"
        }), 500