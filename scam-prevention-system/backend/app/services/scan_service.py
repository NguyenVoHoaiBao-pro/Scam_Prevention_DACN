def analyze_text(text):
    text_lower = text.lower()

    scam_keywords = [
        "bank", "otp", "password", "click link", "verify account",
        "urgent", "transfer money", "lottery", "prize", "win money"
    ]

    score = 0

    for keyword in scam_keywords:
        if keyword in text_lower:
            score += 1

    # Rule-based classification
    if score >= 3:
        risk = "High"
        explanation = "This message contains multiple scam indicators."
    elif score == 2:
        risk = "Medium"
        explanation = "This message has some suspicious patterns."
    else:
        risk = "Low"
        explanation = "No strong scam signals detected."

    return {
        "risk_level": risk,
        "score": score,
        "explanation": explanation
    }