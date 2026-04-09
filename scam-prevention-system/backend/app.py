from flask import Flask, jsonify, request
from flask_cors import CORS
from services.text_detector import analyze_text
from flask import jsonify
from datetime import datetime

app = Flask(__name__)
CORS(app)

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
