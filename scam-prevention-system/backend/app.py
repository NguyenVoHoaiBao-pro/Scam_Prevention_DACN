from flask import Flask, jsonify
from flask_cors import CORS
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


