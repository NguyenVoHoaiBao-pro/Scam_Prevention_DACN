import json
import os
from datetime import datetime

DATA_FILE = 'reports.json'
UPLOAD_FOLDER = 'uploads'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def save_report(data, file):
    report = {
        "id": int(datetime.utcnow().timestamp()),
        "title": data.get("title"),
        "description": data.get("description"),
        "scam_type": data.get("scam_type"),
        "reporter_name": data.get("reporter_name"),
        "email": data.get("email"),
        "created_at": datetime.utcnow().isoformat(),
        "evidence": None
    }

    # Handle file upload
    if file:
        filename = f"{report['id']}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        report["evidence"] = filepath

    # Save JSON
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f:
            json.dump([], f)

    with open(DATA_FILE, 'r') as f:
        reports = json.load(f)

    reports.append(report)

    with open(DATA_FILE, 'w') as f:
        json.dump(reports, f, indent=2)

    return report