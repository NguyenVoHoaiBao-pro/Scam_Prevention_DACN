import os
import sqlite3

from flask import Flask, jsonify, request
from flask_cors import CORS
from services.text_detector import analyze_text
from services.phone_detector import analyze_phone

from app.models.report import db


# Cấu hình SQLite
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///scam_reports.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db.init_app(app)
with app.app_context():
    db.create_all()

AUTH_DB_PATH = os.path.join(os.path.dirname(__file__), "auth.db")


def get_auth_db_connection():
    connection = sqlite3.connect(AUTH_DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


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


@app.route("/api/warnings", methods=["GET", "POST"])
def handle_warnings():
    connection = None
    try:
        connection = get_auth_db_connection()
        cursor = connection.cursor()

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


if __name__ == "__main__":
    app.run(debug=True)