import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib
import os

print("Đang đọc dữ liệu từ file CSV...")

try:
    # 1. Thêm encoding='latin-1' để sửa triệt để lỗi UnicodeDecodeError
    df = pd.read_csv('spam.csv', encoding='latin-1')

    # 2. Xử lý chuẩn hóa bộ dataset 'spam.csv' mặc định của Kaggle
    # Bộ data này thường có cột v1 (nhãn) và v2 (nội dung text)
    if 'v1' in df.columns and 'v2' in df.columns:
        # Đổi tên cột cho khớp với code của chúng ta
        df = df.rename(columns={'v1': 'label', 'v2': 'text'})

        # Đổi chữ 'spam' thành số 1, chữ 'ham' (an toàn) thành số 0
        df['label'] = df['label'].map({'spam': 1, 'ham': 0})

    # Giữ lại đúng 2 cột cần thiết, bỏ qua các cột rác (như Unnamed: 2, 3...)
    df = df[['text', 'label']]

    # Kiểm tra xem file có bị thiếu dữ liệu không và xóa đi
    df = df.dropna()

    print(f"Đã tải thành công {len(df)} tin nhắn để huấn luyện!")
except FileNotFoundError:
    print("Không tìm thấy file spam.csv. Vui lòng kiểm tra lại!")
    exit()
except Exception as e:
    print(f"Có lỗi xảy ra khi đọc file: {e}")
    exit()

print("Đang huấn luyện AI (có thể mất vài giây với dữ liệu lớn)...")
# Xây dựng và cho AI học
model = make_pipeline(TfidfVectorizer(), MultinomialNB())
model.fit(df['text'], df['label'])

# Lưu file AI
os.makedirs('models_saved', exist_ok=True)
model_path = os.path.join('models_saved', 'scam_model.pkl')
joblib.dump(model, model_path)

print(f"Thành công! Đã lưu file AI siêu trí tuệ tại: {model_path}")