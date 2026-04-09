from . import app
from flask import jsonify, request, redirect
import json
import os
import sqlite3
from urllib.parse import urlencode
import requests
import pymysql
from flask import jsonify
import joblib
import os

# Load OAuth config
with open(os.path.join(os.path.dirname(__file__), '..', 'config.json')) as f:
    oauth_config = json.load(f)

FRONTEND_HOME_URL = oauth_config.get("FRONTEND_HOME_URL", "http://localhost:5173/")
AUTH_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'auth.db')


def get_auth_db_connection():
    connection = sqlite3.connect(AUTH_DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_auth_db():
    with get_auth_db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email))"
        )
        connection.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username))"
        )

        # One-time migration from legacy JSON users if the table is empty.
        user_count = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if user_count == 0:
            users_path = os.path.join(os.path.dirname(__file__), '..', 'valid_users.json')
            if os.path.exists(users_path):
                with open(users_path, encoding="utf-8") as f:
                    legacy_users = json.load(f)

                for user in legacy_users:
                    connection.execute(
                        """
                        INSERT OR IGNORE INTO users (id, username, email, password)
                        VALUES (?, ?, ?, ?)
                        """,
                        (
                            user.get("id"),
                            (user.get("username") or "").strip(),
                            (user.get("email") or "").strip().lower(),
                            user.get("password") or "",
                        ),
                    )
            connection.commit()


def get_auth_user(email, username):
    with get_auth_db_connection() as connection:
        return connection.execute(
            """
            SELECT id, username, email, password
            FROM users
            WHERE LOWER(email) = ? OR LOWER(username) = ?
            LIMIT 1
            """,
            (email, username),
        ).fetchone()


def auth_identity_exists(email, username):
    with get_auth_db_connection() as connection:
        row = connection.execute(
            """
            SELECT id
            FROM users
            WHERE LOWER(email) = ? OR LOWER(username) = ?
            LIMIT 1
            """,
            (email, username),
        ).fetchone()
        return row is not None


def create_auth_user(username, email, password):
    with get_auth_db_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO users (username, email, password)
            VALUES (?, ?, ?)
            """,
            (username, email, password),
        )
        connection.commit()
        return {
            "id": cursor.lastrowid,
            "username": username,
            "email": email,
        }


init_auth_db()


@app.route("/api/auth/login", methods=["POST"])
def email_password_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    if not password or (not email and not username):
        return jsonify({"error": "email/username and password are required"}), 400

    matched_user = get_auth_user(email, username)
    if not matched_user or password != (matched_user["password"] or ""):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": matched_user["id"],
            "username": matched_user["username"],
            "email": matched_user["email"]
        }
    })


@app.route("/api/auth/register", methods=["POST"])
def email_password_register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400

    if auth_identity_exists(email, username.lower()):
        return jsonify({"error": "Email or username already exists"}), 409

    new_user = create_auth_user(username, email, password)

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
    # OAuth completed, send user back to homepage.
    return redirect(FRONTEND_HOME_URL)


@app.route("/api/auth/facebook/login")
def facebook_login():
    params = {
        "client_id": oauth_config["FACEBOOK_CLIENT_ID"],
        "redirect_uri": oauth_config["FACEBOOK_REDIRECT_URI"],
        "state": "random_state_string",  # Should be random in production
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
    # OAuth completed, send user back to homepage.
    return redirect(FRONTEND_HOME_URL)

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
# LOAD FILE AI MODEL
# ==========================================
# Đường dẫn chỉ đến file scam_model.pkl bạn vừa tạo
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models_saved', 'scam_model.pkl')

try:
    scam_model = joblib.load(MODEL_PATH)
    print("Đã tải thành công AI Model!")
except Exception as e:
    scam_model = None
    print(f"Lỗi tải AI Model: {str(e)}. Hệ thống sẽ dùng từ khóa mặc định.")

# ==========================================
# API ENDPOINT: Quét văn bản bằng AI
# ==========================================
@app.route("/api/detect-text", methods=["POST"])
def detect_text():
    data = request.get_json()
    text = data.get("text", "")

    if not text.strip():
        return jsonify({"input_text": text, "is_scam": False, "message": "Vui lòng nhập nội dung."})

    is_scam = False

    if scam_model:
        # DÙNG AI ĐỂ DỰ ĐOÁN (PREDICT)
        prediction = scam_model.predict([text])[0] # AI trả về 1 hoặc 0
        is_scam = bool(prediction == 1)
    else:
        # Nếu AI lỗi, dùng lại logic từ khóa cũ làm phương án dự phòng
        suspicious_keywords = ["otp", "chuyển khoản", "trúng thưởng", "click link", "xác minh tài khoản"]
        is_scam = any(keyword.lower() in text.lower() for keyword in suspicious_keywords)

    return jsonify({
        "input_text": text,
        "is_scam": is_scam,
        "message": "Phát hiện nội dung có dấu hiệu lừa đảo!" if is_scam else "Văn bản an toàn, không có dấu hiệu lừa đảo."
    })

def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='12345',
        database='scam_prevention_db',
        cursorclass=pymysql.cursors.DictCursor
    )
@app.route("/api/warnings", methods=["GET", "POST"])
def handle_warnings():
    connection = None
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            # NẾU LÀ GỬI BÁO CÁO MỚI TỪ TRANG SCAN
            if request.method == "POST":
                data = request.get_json()
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

            # NẾU LÀ LẤY DANH SÁCH CHO TRANG REPORT
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