def check_bank_account(bank_name, account_number):
    scam_accounts = {
        "123456789": {
            "reason": "Tài khoản đã bị nhiều người báo cáo nhận tiền lừa đảo",
            "risk_score": 92
        },
        "987654321": {
            "reason": "Tài khoản nằm trong danh sách nghi ngờ giao dịch bất thường",
            "risk_score": 85
        },
        "111222333": {
            "reason": "Tài khoản từng xuất hiện trong báo cáo giả mạo chuyển khoản",
            "risk_score": 78
        }
    }

    account_number = str(account_number).strip()

    if account_number in scam_accounts:
        scam_info = scam_accounts[account_number]

        return {
            "success": True,
            "type": "bank",
            "input_value": account_number,
            "bank_name": bank_name,
            "is_scam": True,
            "risk_score": scam_info["risk_score"],
            "risk_level": "high",
            "matched_patterns": [
                "Tài khoản nằm trong blacklist nội bộ",
                scam_info["reason"]
            ],
            "recommendation": "Không chuyển tiền vào tài khoản này. Hãy xác minh lại người nhận và báo cáo nếu cần.",
            "message": f"Tài khoản {account_number} có dấu hiệu rủi ro cao!"
        }

    return {
        "success": True,
        "type": "bank",
        "input_value": account_number,
        "bank_name": bank_name,
        "is_scam": False,
        "risk_score": 12,
        "risk_level": "low",
        "matched_patterns": [],
        "recommendation": "Chưa phát hiện dấu hiệu bất thường trong dữ liệu mẫu hiện tại.",
        "message": f"Tài khoản {account_number} hiện chưa có trong danh sách nghi ngờ."
    }