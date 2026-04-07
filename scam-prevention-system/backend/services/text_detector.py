from pathlib import Path
import joblib

from services.preprocess import preprocess_text
from services.rules import extract_patterns

BACKEND_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BACKEND_DIR / "models_saved"
MODEL_PATH = MODEL_DIR / "scam_model.pkl"
VECTORIZER_PATH = MODEL_DIR / "tfidf_vectorizer.pkl"

_model = None
_vectorizer = None


def load_model_assets():
    global _model, _vectorizer

    if _model is None or _vectorizer is None:
        _model = joblib.load(MODEL_PATH)
        _vectorizer = joblib.load(VECTORIZER_PATH)

    return _model, _vectorizer


def get_risk_level(score: int) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def build_message(score: int) -> str:
    if score >= 70:
        return "Tin nhắn có nhiều dấu hiệu lừa đảo/phishing rõ rệt."
    if score >= 40:
        return "Tin nhắn có một số dấu hiệu đáng ngờ, cần kiểm tra kỹ."
    return "Chưa phát hiện nhiều dấu hiệu lừa đảo theo bộ luật hiện tại."


def combine_scores(rule_score: int, ml_probability: float, matched_patterns: list[str]) -> int:
    ml_score = int(ml_probability * 100)

    # Hybrid score: cân bằng giữa model và rule
    final_score = int(0.55 * ml_score + 0.45 * rule_score)

    # Override nhẹ nếu có combo nguy hiểm mạnh
    if "otp_urgency_combo" in matched_patterns:
        final_score = max(final_score, 70)

    if "link_sensitive_action_combo" in matched_patterns:
        final_score = max(final_score, 75)

    if "account_verification_combo" in matched_patterns and rule_score >= 40:
        final_score = max(final_score, 65)

    return min(final_score, 100)


def analyze_text(text: str) -> dict:
    processed = preprocess_text(text)
    rule_score, matched_patterns = extract_patterns(text, processed)

    try:
        model, vectorizer = load_model_assets()

        text_vector = vectorizer.transform([processed])
        ml_prediction = int(model.predict(text_vector)[0])

        if hasattr(model, "predict_proba"):
            ml_probability = float(model.predict_proba(text_vector)[0][1])
        else:
            # fallback nếu model không support predict_proba
            ml_probability = 1.0 if ml_prediction == 1 else 0.0

        final_score = combine_scores(rule_score, ml_probability, matched_patterns)

        is_scam = final_score >= 45
        risk_level = get_risk_level(final_score)

        recommendation = (
            "Không bấm vào liên kết, không cung cấp OTP/mật khẩu, và xác minh qua kênh chính thức."
            if is_scam
            else "Tiếp tục cẩn trọng nếu tin nhắn liên quan đến tài khoản, OTP hoặc chuyển tiền."
        )

        return {
            "status": "success",
            "type": "text",
            "engine": "hybrid_rule_ml_v1",
            "input_text": text,
            "processed_text": processed,
            "is_scam": is_scam,
            "risk_score": final_score,
            "risk_level": risk_level,
            "rule_score": rule_score,
            "ml_prediction": ml_prediction,
            "ml_probability": round(ml_probability, 4),
            "matched_patterns": matched_patterns,
            "message": build_message(final_score),
            "recommendation": recommendation,
        }

    except Exception as e:
        # fallback sang rule-based nếu model chưa load được
        is_scam = rule_score >= 45
        risk_level = get_risk_level(rule_score)

        recommendation = (
            "Không bấm vào liên kết, không cung cấp OTP/mật khẩu, và xác minh qua kênh chính thức."
            if is_scam
            else "Tiếp tục cẩn trọng nếu tin nhắn liên quan đến tài khoản, OTP hoặc chuyển tiền."
        )

        return {
            "status": "success",
            "type": "text",
            "engine": "rule_based_fallback",
            "input_text": text,
            "processed_text": processed,
            "is_scam": is_scam,
            "risk_score": rule_score,
            "risk_level": risk_level,
            "rule_score": rule_score,
            "ml_prediction": None,
            "ml_probability": None,
            "matched_patterns": matched_patterns,
            "message": build_message(rule_score),
            "recommendation": recommendation,
            "warning": f"Không load được model ML, đang dùng fallback rule-based: {str(e)}",
        }