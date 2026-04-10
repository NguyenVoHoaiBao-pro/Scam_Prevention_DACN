import re

def preprocess_text(text: str) -> str:
    if not text:
        return ""

    text = text.strip().lower()

    # Chuẩn hóa link
    text = re.sub(r'https?://\S+|www\.\S+', ' URL ', text)

    # Chuẩn hóa số
    text = re.sub(r'\d+', ' NUMBER ', text)

    # Bỏ khoảng trắng thừa
    text = re.sub(r'\s+', ' ', text)

    return text.strip()