from flask import Blueprint, request, jsonify
from app.services.scan_service import analyze_text

scan_bp = Blueprint('scan_bp', __name__)

@scan_bp.route('/api/scan', methods=['POST'])
def scan_content():
    try:
        data = request.get_json()
        text = data.get('text')

        if not text:
            return jsonify({
                "status": "error",
                "message": "Text is required"
            }), 400

        result = analyze_text(text)

        return jsonify({
            "status": "success",
            "data": result
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500