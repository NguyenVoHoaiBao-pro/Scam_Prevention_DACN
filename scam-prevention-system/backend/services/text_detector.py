from services.preprocess import preprocess_text
from services.rules import extract_patterns

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

def analyze_text(text: str) -> dict:
    processed = preprocess_text(text)
    rule_score, matched_patterns = extract_patterns(text, processed)

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
        "engine": "rule_based_v1",
        "input_text": text,
        "processed_text": processed,
        "is_scam": is_scam,
        "risk_score": rule_score,
        "risk_level": risk_level,
        "matched_patterns": matched_patterns,
        "message": build_message(rule_score),
        "recommendation": recommendation,
    }