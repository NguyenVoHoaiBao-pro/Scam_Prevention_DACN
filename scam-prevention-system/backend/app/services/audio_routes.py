from flask import Blueprint, request, jsonify
from app.services.speech_to_text import process_audio_file

audio_bp = Blueprint("audio_bp", __name__)


@audio_bp.route("/api/check-audio", methods=["POST"])
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