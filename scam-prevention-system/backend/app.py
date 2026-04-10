from flask import Flask, jsonify, request
from flask_cors import CORS
from services.text_detector import analyze_text
from flask import jsonify
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import os

from app.models.report import db


# Cấu hình SQLite
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///scam_reports.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db.init_app(app)
with app.app_context():
    db.create_all()

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
            "error": "Thiếu trường 'text'."
        }), 400

    result = analyze_text(text)
    return jsonify(result), 200

if __name__ == "__main__":
    app.run(debug=True)
