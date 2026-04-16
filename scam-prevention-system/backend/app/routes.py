
from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
from datetime import datetime
import os
import sqlite3
from urllib.parse import urlencode
import requests
import joblib
from .services.report_handler import save_report, get_reports
import bcrypt
from services.preprocess import preprocess_text
from services.text_detector import analyze_text
from services.phone_detector import analyze_phone

from app.services.speech_to_text import process_audio_file
from app.services.bank_lookup import check_bank_account

# ====================== FLASK APP SETUP ======================
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///scam_reports.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Khởi tạo CORS ngay sau khi tạo app
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})
#CORS(app)

db = SQLAlchemy()
db.init_app(app)

with app.app_context():
    db.create_all()

# ==========================================
# LOAD OAUTH CONFIG
# ==========================================
with open(os.path.join(os.path.dirname(__file__), '..', 'config.json')) as f:
    oauth_config = json.load(f)

FRONTEND_HOME_URL = oauth_config.get("FRONTEND_HOME_URL", "http://localhost:5173/")
AUTH_DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'auth.db')


def get_auth_db_connection():
    connection = sqlite3.connect(AUTH_DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

# ==========================================
# USER LOGIN / REGISTER HELPER
# ==========================================
def load_valid_users():
    users_path = os.path.join(os.path.dirname(__file__), '..', 'valid_users.json')
    with open(users_path, encoding="utf-8") as f:
        return json.load(f)
def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password, stored_password_hash):
    if not stored_password_hash:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            stored_password_hash.encode("utf-8")
        )
    except ValueError:
        return False


def looks_like_bcrypt_hash(value):
    return isinstance(value, str) and value.startswith(("$2a$", "$2b$", "$2y$"))


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
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS warnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                risk_level TEXT NOT NULL DEFAULT 'High',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
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
                            hash_password(user.get("password") or ""),
                        ),
                    )

        # One-time migration for existing plaintext passwords in SQLite auth.db.
        users = connection.execute("SELECT id, password FROM users").fetchall()
        for user in users:
            current_password = user["password"] or ""
            if not looks_like_bcrypt_hash(current_password):
                connection.execute(
                    "UPDATE users SET password = ? WHERE id = ?",
                    (hash_password(current_password), user["id"]),
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
        password_hash = hash_password(password)
        cursor = connection.execute(
            """
            INSERT INTO users (username, email, password)
            VALUES (?, ?, ?)
            """,
            (username, email, password_hash),
        )
        connection.commit()
        return {
            "id": cursor.lastrowid,
            "username": username,
            "email": email,
        }


init_auth_db()

def init_warnings_table():
    with get_auth_db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS warnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                risk_level TEXT NOT NULL DEFAULT 'High',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()


init_warnings_table()
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

    matched_user = get_auth_user(email, username)
    if not matched_user or not verify_password(password, matched_user["password"] or ""):
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
# Route để lấy danh sách Reports (GET)
@app.route("/api/reports", methods=["GET"])
def fetch_reports():
    try:
        reports = get_reports()
        # React đang mong đợi một mảng trực tiếp: setWarnings(result);
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route để lưu Report mới (POST)
@app.route("/api/report", methods=["POST"])
def create_report():
    try:
        # gửi bằng FormData nên phải dùng request.form ở Flask
        data = request.form
        
        # Hàm save_report cần 2 tham số: data và file
        # Nếu React không gửi file đính kèm, request.files.get('file') sẽ trả về None
        file = request.files.get('file') 
        
        report = save_report(data, file)
        
        # Trả về status success để React nhận biết (if response.ok)
        return jsonify({
            "status": "success", 
            "message": "Report saved successfully",
            "data": report
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({
            "status": "duplicate",
            "message": "Report already exists"
        }), 200
# ==========================================
# LOAD AI MODEL
# ==========================================
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models_saved', 'scam_model.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models_saved', 'tfidf_vectorizer.pkl')

try:
    scam_model = joblib.load(MODEL_PATH)
    tfidf_vectorizer = joblib.load(VECTORIZER_PATH)
    print("Da tai thanh cong AI Model va vectorizer!")
except Exception as e:
    scam_model = None
    tfidf_vectorizer = None
    print(f"Loi tai AI assets: {str(e)}. He thong se dung tu khoa mac dinh.")


# ==========================================
# TEXT SCAM DETECTION
# ==========================================
"""
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

    if scam_model and tfidf_vectorizer:
        try:
            processed_text = preprocess_text(text)
            text_vector = tfidf_vectorizer.transform([processed_text])
            prediction = scam_model.predict(text_vector)[0]
            is_scam = bool(prediction == 1)
        except Exception:
            suspicious_keywords = ["otp", "chuyển khoản", "trúng thưởng", "click link", "xác minh tài khoản"]
            is_scam = any(keyword.lower() in text.lower() for keyword in suspicious_keywords)
    else:
        suspicious_keywords = ["otp", "chuyển khoản", "trúng thưởng", "click link", "xác minh tài khoản"]
        is_scam = any(keyword.lower() in text.lower() for keyword in suspicious_keywords)

    return jsonify({
        "input_text": text,
        "is_scam": is_scam,
        "message": "Phát hiện nội dung có dấu hiệu lừa đảo!" if is_scam else "Văn bản an toàn, không có dấu hiệu lừa đảo."
    })
"""
@app.route("/api/detect-text", methods=["POST"])
def detect_text():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({
            "status": "error",
            "error": "Missing required field: 'text'."
        }), 400

    result = analyze_text(text)
    return jsonify(result), 200

@app.route("/api/detect-phone", methods=["POST"])
def detect_phone():
    data = request.get_json(silent=True) or {}
    phone = (data.get("phone") or "").strip()

    if not phone:
        return jsonify({
            "status": "error",
            "error": "Missing required field: 'phone'."
        }), 400

    result = analyze_phone(phone)
    return jsonify(result), 200




"""
@app.route("/api/warnings", methods=["GET", "POST"])
def handle_warnings():
    connection = None
    try:
        connection = get_auth_db_connection()
        cursor = connection.cursor()
            # NẾU LÀ GỬI BÁO CÁO MỚI TỪ TRANG SCAN
        if request.method == "POST":
            data = request.get_json(silent=True) or {}
            title = (data.get("title") or "").strip()
            content = (data.get("content") or "").strip()
            risk_level = (data.get("risk_level") or "High").strip() or "High"

            if not title or not content:
                return jsonify({
                    "status": "error",
                    "message": "title and content are required"
                }), 400

            sql = "INSERT INTO warnings (title, content, risk_level) VALUES (?, ?, ?)"
            cursor.execute(sql, (title, content, risk_level))
            connection.commit()

            return jsonify({
                "status": "success",
                "message": "Đã lưu cảnh báo vào cơ sở dữ liệu!"
            }), 201

        # NẾU LÀ LẤY DANH SÁCH CHO TRANG REPORT
        sql = "SELECT id, title, content, risk_level, created_at FROM warnings ORDER BY created_at DESC"
        cursor.execute(sql)
        warnings = [dict(row) for row in cursor.fetchall()]

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
        if connection:
            connection.close()
"""
@app.route("/api/warnings", methods=["GET", "POST"])
def handle_warnings():
    connection = None
    try:
        connection = get_auth_db_connection()
        cursor = connection.cursor()

        if request.method == "POST":
            if request.form:
                title = (request.form.get("title") or "").strip()
                content = (request.form.get("description") or "").strip()
                risk_level = (request.form.get("risk_level") or "High").strip()
            else:
                data = request.get_json(silent=True) or {}
                title = (data.get("title") or "").strip()
                content = (data.get("content") or "").strip()
                risk_level = (data.get("risk_level") or "High").strip() or "High"
                
            if not title or not content:
                return jsonify({
                    "status": "error",
                    "message": "title and content are required"
                }), 400

            cursor.execute(
                "INSERT INTO warnings (title, content, risk_level) VALUES (?, ?, ?)",
                (title, content, risk_level),
            )
            connection.commit()

            return jsonify({
                "status": "success",
                "message": "Warning saved successfully"
            }), 201

        cursor.execute(
            "SELECT id, title, content, risk_level, created_at FROM warnings ORDER BY created_at DESC"
        )
        warnings = [dict(row) for row in cursor.fetchall()]

        return jsonify({
            "status": "success",
            "data": warnings
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Database error: {str(e)}"
        }), 500
    finally:
        if connection:
            connection.close()

@app.route("/api/check-bank-account", methods=["POST"])
def check_bank_account_route():
    try:
        data = request.get_json(silent=True) or {}
        bank_name = data.get("bank_name")
        account_number = data.get("account_number")

        if not bank_name or not account_number:
            return jsonify({
                "status": "error",
                "message": "bank_name and account_number are required"
            }), 400

        # Gọi hàm từ service
        result = check_bank_account(bank_name, account_number)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
# ==========================================
# AUDIO / VOICE SCAM DETECTION (Voice to Text)
# ==========================================
@app.route("/api/check-audio", methods=["POST"])
def check_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "message": "No audio file uploaded"
            }), 400

        audio_file = request.files['audio']

        if audio_file.filename == '':
            return jsonify({
                "success": False,
                "message": "No selected file"
            }), 400

        # Gọi hàm xử lý audio từ speech_to_text.py
        result = process_audio_file(audio_file)

        if not result.get("success", False):
            return jsonify(result), 400

        # Thêm type để frontend nhận biết
        result["type"] = "audio"
        
        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500
    
