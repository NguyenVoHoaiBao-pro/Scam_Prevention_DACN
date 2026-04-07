import re

SCAM_KEYWORDS = {
    "otp": 30,
    "xác minh": 15,
    "xác thực": 15,
    "bị khóa": 20,
    "tài khoản": 10,
    "trúng thưởng": 20,
    "nhận thưởng": 15,
    "chuyển khoản": 20,
    "chuyển tiền": 20,
    "khẩn cấp": 15,
    "ngay": 10,
    "miễn phí": 8,
    "đăng nhập": 12,
    "mật khẩu": 20,
    "hoàn tiền": 10,
    "ưu đãi": 8,
    "kích hoạt": 10,
    "xác nhận": 10
}

def extract_patterns(original_text: str, processed_text: str):
    score = 0
    matched_patterns = []

    # 1) Keyword đơn lẻ
    for keyword, pts in SCAM_KEYWORDS.items():
        if keyword in processed_text:
            score += pts
            matched_patterns.append(keyword)

    # 2) Có link
    if re.search(r'https?://\S+|www\.\S+', original_text, flags=re.IGNORECASE):
        score += 15
        matched_patterns.append("contains_link")

    # 3) Ngôn ngữ thúc ép / đe dọa
    urgency_patterns = [
        r"khẩn cấp",
        r"ngay lập tức",
        r"nếu không",
        r"trong vòng \d+\s*(phút|giờ)",
        r"xử lý ngay",
        r"thực hiện ngay",
        r"gấp",
    ]
    for pattern in urgency_patterns:
        if re.search(pattern, processed_text, flags=re.IGNORECASE):
            score += 10
            matched_patterns.append("urgent_language")
            break

    # 4) Quá nhiều dấu chấm than
    if original_text.count("!") >= 3:
        score += 8
        matched_patterns.append("excessive_exclamation")

    # 5) Combo nguy hiểm: OTP + thúc ép
    if "otp" in processed_text and (
        "ngay" in processed_text
        or "ngay lập tức" in processed_text
        or "khẩn cấp" in processed_text
        or "gấp" in processed_text
    ):
        score += 20
        matched_patterns.append("otp_urgency_combo")

    # 6) Combo nguy hiểm: tài khoản + xác minh/xác thực
    if "tài khoản" in processed_text and (
        "xác minh" in processed_text
        or "xác thực" in processed_text
        or "đăng nhập" in processed_text
    ):
        score += 15
        matched_patterns.append("account_verification_combo")

    # 7) Combo nguy hiểm: link + hành động nhạy cảm
    if ("contains_link" in matched_patterns) and (
        "otp" in processed_text
        or "mật khẩu" in processed_text
        or "đăng nhập" in processed_text
        or "xác minh" in processed_text
    ):
        score += 20
        matched_patterns.append("link_sensitive_action_combo")

    # 8) Combo nguy hiểm: trúng thưởng + link / yêu cầu thao tác
    if (
        "trúng thưởng" in processed_text
        or "nhận thưởng" in processed_text
    ) and (
        "contains_link" in matched_patterns
        or "xác nhận" in processed_text
        or "click" in processed_text
    ):
        score += 15
        matched_patterns.append("prize_claim_combo")

    # 9) Loại bỏ trùng lặp pattern, giữ nguyên thứ tự
    matched_patterns = list(dict.fromkeys(matched_patterns))

    return min(score, 100), matched_patterns    