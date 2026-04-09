from pathlib import Path
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

from services.preprocess import preprocess_text


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent
DATA_PATH = PROJECT_DIR / "dataset" / "sms_dataset.csv"

MODEL_DIR = BACKEND_DIR / "models_saved"
MODEL_PATH = MODEL_DIR / "scam_model.pkl"
VECTORIZER_PATH = MODEL_DIR / "tfidf_vectorizer.pkl"


def load_dataset():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Không tìm thấy dataset tại: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)

    required_columns = {"text", "label"}
    if not required_columns.issubset(df.columns):
        raise ValueError("CSV phải có 2 cột: text, label")

    df = df.dropna(subset=["text", "label"]).copy()
    df["text"] = df["text"].astype(str).str.strip()
    df = df[df["text"] != ""]
    df["label"] = df["label"].astype(int)

    return df


def main():
    print(f"Đang đọc dữ liệu từ: {DATA_PATH}")
    df = load_dataset()

    print(f"Tổng số mẫu: {len(df)}")
    print("Phân bố nhãn:")
    print(df["label"].value_counts())

    df["processed_text"] = df["text"].apply(preprocess_text)

    X = df["processed_text"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_vec, y_train)

    y_pred = model.predict(X_test_vec)

    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {accuracy:.4f}\n")
    print("Classification report:")
    print(classification_report(y_test, y_pred, digits=4))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)

    print(f"Đã lưu model tại: {MODEL_PATH}")
    print(f"Đã lưu vectorizer tại: {VECTORIZER_PATH}")


if __name__ == "__main__":
    main()