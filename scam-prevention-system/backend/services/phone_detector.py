import re

REPORTED_NUMBERS = {
    "84901234567": {
        "label": "scam",
        "report_count": 9,
        "tags": ["bank_impersonation", "otp_request"],
        "note": "Reported multiple times for bank impersonation and OTP requests."
    },
    "84888888888": {
        "label": "suspicious",
        "report_count": 4,
        "tags": ["loan_scam"],
        "note": "Multiple reports mention loan scam content and malicious links."
    },
    "84333333333": {
        "label": "scam",
        "report_count": 6,
        "tags": ["delivery_scam"],
        "note": "Reported in connection with fake delivery scam calls."
    },
}


def get_risk_level(score: int) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def normalize_phone(phone: str) -> str:
    raw = (phone or "").strip()
    if not raw:
        return ""

    digits = re.sub(r"\D", "", raw)

    if digits.startswith("84"):
        return digits

    if digits.startswith("0"):
        return "84" + digits[1:]

    return digits


def is_valid_vn_phone(normalized_phone: str) -> bool:
    return bool(re.fullmatch(r"84(?:3|5|7|8|9)\d{8}", normalized_phone))


def format_phone(normalized_phone: str) -> str:
    if not normalized_phone:
        return ""

    if normalized_phone.startswith("84") and len(normalized_phone) == 11:
        local = "0" + normalized_phone[2:]
        return f"{local[:4]} {local[4:7]} {local[7:]}"

    return normalized_phone


def analyze_phone(phone: str) -> dict:
    input_phone = (phone or "").strip()
    normalized_phone = normalize_phone(input_phone)
    display_phone = format_phone(normalized_phone)

    matched_patterns = []
    score = 0

    if not is_valid_vn_phone(normalized_phone):
        matched_patterns.append("invalid_format")

        return {
            "status": "success",
            "type": "phone",
            "engine": "phone_rule_engine_v1",
            "input_phone": input_phone,
            "normalized_phone": normalized_phone,
            "display_phone": display_phone or input_phone,
            "is_valid": False,
            "is_scam": False,
            "risk_score": 10,
            "risk_level": "low",
            "rule_score": 10,
            "ml_prediction": None,
            "ml_probability": None,
            "matched_patterns": matched_patterns,
            "report_count": 0,
            "message": "The phone number format is invalid for lookup.",
            "recommendation": "Please check the number and enter it in the format 0xxxxxxxxx or +84xxxxxxxxx.",
            "warning": "Phone format validation failed.",
        }

    record = REPORTED_NUMBERS.get(normalized_phone)

    if record:
        if record["label"] == "scam":
            score += 75
            matched_patterns.append("reported_number")
            matched_patterns.append("blacklisted_number")
        else:
            score += 45
            matched_patterns.append("community_reported")

        if record.get("report_count", 0) >= 5:
            score += 10
            matched_patterns.append("multiple_reports")

        tags = record.get("tags", [])

        if "bank_impersonation" in tags:
            score += 8
            matched_patterns.append("bank_impersonation")

        if "otp_request" in tags:
            score += 8
            matched_patterns.append("otp_request_pattern")

        if "delivery_scam" in tags:
            score += 6
            matched_patterns.append("delivery_scam_pattern")

        if "loan_scam" in tags:
            score += 6
            matched_patterns.append("loan_scam_pattern")

        score = min(score, 100)

        is_scam = score >= 45

        return {
            "status": "success",
            "type": "phone",
            "engine": "phone_rule_engine_v1",
            "input_phone": input_phone,
            "normalized_phone": normalized_phone,
            "display_phone": display_phone,
            "is_valid": True,
            "is_scam": is_scam,
            "risk_score": score,
            "risk_level": get_risk_level(score),
            "rule_score": score,
            "ml_prediction": None,
            "ml_probability": None,
            "matched_patterns": matched_patterns,
            "report_count": record.get("report_count", 0),
            "message": "This phone number has risk reports in the internal system.",
            "recommendation": "Do not follow money transfer requests, do not share OTPs or passwords, and block the number if it shows signs of impersonation or fraud.",
            "note": record.get("note"),
        }

    score = 15
    matched_patterns.append("no_internal_reports")

    return {
        "status": "success",
        "type": "phone",
        "engine": "phone_rule_engine_v1",
        "input_phone": input_phone,
        "normalized_phone": normalized_phone,
        "display_phone": display_phone,
        "is_valid": True,
        "is_scam": False,
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "rule_score": score,
        "ml_prediction": None,
        "ml_probability": None,
        "matched_patterns": matched_patterns,
        "report_count": 0,
        "message": "No high-risk internal reports have been recorded for this phone number.",
        "recommendation": "If this number asks for money transfers, OTPs, or claims to represent an organization, you should still verify it through official channels.",
    }