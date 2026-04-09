import os
import tempfile
from werkzeug.utils import secure_filename


def process_audio_file(audio_file):
    try:
        if not audio_file:
            return {
                "success": False,
                "message": "Không có file audio"
            }

        filename = audio_file.filename.lower()

        # Kiểm tra định dạng file
        if not (filename.endswith(".mp3") or filename.endswith(".wav") or filename.endswith(".m4a")):
            return {
                "success": False,
                "message": "Chỉ hỗ trợ file .mp3, .wav, .m4a"
            }

        # ==========================
        # LƯU FILE TẠM
        # ==========================
        temp_dir = tempfile.gettempdir()
        safe_name = secure_filename(audio_file.filename)
        temp_path = os.path.join(temp_dir, safe_name)
        audio_file.save(temp_path)

        # ==========================
        # GIẢ LẬP speech-to-text TẠM THỜI
        # (KHÔNG cần AI thật, test được)
        # ==========================
        #
        # Vì bạn muốn "test được là được", chưa cần model thật,
        # nên tạm thời mình sẽ sinh transcript dựa trên tên file.
        #
        # Ví dụ:
        # - otp.mp3 -> transcript lừa đảo
        # - chuyenkhoan.wav -> transcript lừa đảo
        # - safe.m4a -> transcript an toàn
        #

        lower_name = safe_name.lower()

        if "otp" in lower_name or "khoa" in lower_name or "bank" in lower_name:
            transcript = "Tài khoản của bạn đang bị khóa, vui lòng cung cấp mã OTP để xác minh"
        elif "chuyenkhoan" in lower_name or "ck" in lower_name:
            transcript = "Bạn cần chuyển khoản trước để nhận quà và xác thực giao dịch"
        elif "trungthuong" in lower_name:
            transcript = "Bạn đã trúng thưởng, hãy bấm vào link và cung cấp thông tin ngân hàng"
        else:
            transcript = "Xin chào, đây là cuộc gọi bình thường không có nội dung đáng ngờ"

        # ==========================
        # PHÂN TÍCH NỘI DUNG LỪA ĐẢO CƠ BẢN (RULE-BASED)
        # ==========================
        suspicious_patterns = {
            "otp": 30,
            "xác minh": 15,
            "tài khoản bị khóa": 25,
            "bị khóa": 20,
            "chuyển khoản": 25,
            "chuyển tiền": 25,
            "trúng thưởng": 20,
            "click link": 15,
            "bấm vào link": 15,
            "cung cấp thông tin ngân hàng": 25,
            "mã xác thực": 20,
            "xác thực giao dịch": 20
        }

        transcript_lower = transcript.lower()

        matched = []
        risk_score = 0

        for keyword, score in suspicious_patterns.items():
            if keyword in transcript_lower:
                matched.append(keyword)
                risk_score += score

        # Giới hạn điểm tối đa
        risk_score = min(risk_score, 95)

        # Xác định mức độ rủi ro
        if risk_score >= 70:
            risk_level = "high"
        elif risk_score >= 40:
            risk_level = "medium"
        else:
            risk_level = "low"

        is_scam = risk_score >= 40

        # ==========================
        # XÓA FILE TẠM
        # ==========================
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass

        return {
            "success": True,
            "type": "audio",
            "input_text": transcript,   # frontend của bạn nên dùng input_text
            "transcript": transcript,   # giữ luôn cho dễ debug
            "is_scam": is_scam,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "matched_patterns": matched,
            "recommendation": (
                "Không cung cấp OTP, không chuyển khoản trước, không bấm link lạ."
                if is_scam
                else "Chưa phát hiện dấu hiệu lừa đảo rõ ràng trong nội dung audio."
            ),
            "message": (
                "Audio có dấu hiệu lừa đảo!"
                if is_scam
                else "Audio tương đối an toàn."
            )
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Lỗi xử lý audio: {str(e)}"
        }