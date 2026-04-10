from flask import Flask, jsonify, request
from flask_cors import CORS
from services.text_detector import analyze_text
from services.phone_detector import analyze_phone

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


if __name__ == "__main__":
    app.run(debug=True)