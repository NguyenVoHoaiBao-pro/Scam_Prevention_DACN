def check_bank_account(bank_name, account_number):
    scam_accounts = {
        "Vietcombank": {
            "123456789": {
                "reason": "Reported scam multiple times",
                "risk_score": 92
            }
        },
        "Techcombank": {
            "987654321": {
                "reason": "Suspicious transaction activity",
                "risk_score": 85
            }
        },
        "MB Bank": {
            "111222333": {
                "reason": "Fake transfer scam",
                "risk_score": 78
            }
        }
    }

    account_number = str(account_number).strip()

    if bank_name in scam_accounts and account_number in scam_accounts[bank_name]:
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
                "The account is on the internal blacklist.",
                scam_info["reason"]
            ],
            "recommendation": "Do not transfer money to this account. Please verify the recipient and report if necessary.",
            "message": f"Account {account_number} there are signs of high risk!"
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
        "recommendation": "No abnormalities have been detected in the current sample data.",
        "message": f"Account {account_number} not currently on the list of suspects."
    }