import os
import tempfile
from werkzeug.utils import secure_filename
from faster_whisper import WhisperModel
import eng_to_ipa as ipa

# load model 1 lần (quan trọng)
model = WhisperModel("base", compute_type="int8")


def detect_scam(text):
    text_lower = text.lower()  

    suspicious_keywords = [
        "otp",
        "verify",
        "locked",
        "transfer",
        "win",
        "click link",
        "bank",
        "account"
    ]

    keywords = {
        "otp": 40,
        "verify": 20,
        "transfer": 30,
        "click link": 40,
        "bank": 10
    }

    score = sum(weight for k, weight in keywords.items() if k in text_lower)
    score = min(score, 100)

    matched = [w for w in suspicious_keywords if w in text_lower]


    if score >= 60:
        level = "high"
    elif score >= 30:
        level = "medium"
    else:
        level = "low"

    return matched, score, level


def process_audio_file(audio_file):
    temp_path = None

    try:
        if not audio_file:
            return {"success": False, "message": "There are no audio files"}

        filename = audio_file.filename.lower()

        if not filename.endswith((".mp3", ".wav", ".m4a")):
            return {"success": False, "message": "Only supports mp3/wav/m4a"}

        # lưu file tạm
        temp_dir = tempfile.gettempdir()
        safe_name = secure_filename(audio_file.filename)
        temp_path = os.path.join(temp_dir, safe_name)
        audio_file.save(temp_path)

        # =========================
        # REAL SPEECH TO TEXT
        # =========================
        segments, _ = model.transcribe(temp_path)

        transcript = " ".join([seg.text for seg in segments if seg.text]).strip()

        if not transcript:
            return {"success": False, "message": "Voice not recognized"}

        # =========================
        # DETECT SCAM
        # =========================
        matched, score, level = detect_scam(transcript)

        is_scam = score >= 30

        # =========================
        # IPA (English only chuẩn hơn)
        # =========================
        try:
            ipa_text = ipa.convert(transcript)
        except:
            ipa_text = "/not-supported/"

        return {
            "success": True,
            "type": "audio",
            "input_text": transcript,
            "ipa": ipa_text,
            "matched_patterns": matched,
            "is_scam": is_scam,
            "risk_score": score,
            "risk_level": level,
            "message": (
                "Suspicious content suspected of being fraudulent!"
                if is_scam
                else "No signs of fraud were detected."
            ),
            "recommendation": (
                "Do not provide OTP or transfer money."
                if is_scam
                else "It's probably safe."
            ),
            "engine": "Whisper + rule-based"
        }

    except Exception as e:
        import traceback
        traceback.print_exc() 
        return {"success": False, "message": str(e)}

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass