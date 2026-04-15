from flask import Blueprint, request, jsonify
from app.services.bank_lookup import check_bank_account

bank_bp = Blueprint("bank_bp", __name__)


@bank_bp.route("/api/check-bank-account", methods=["POST"])
def check_bank_account_api():
    try:
        data = request.get_json(silent=True) or {}

        if not data:
            return jsonify({
                "success": False,
                "message": "Không nhận được dữ liệu JSON"
            }), 400

        bank_name = data.get("bank_name", "").strip()
        account_number = data.get("account_number", "").strip()

        if not bank_name or not account_number:
            return jsonify({
                "success": False,
                "message": "Thiếu bank_name hoặc account_number"
            }), 400

        result = check_bank_account(bank_name, account_number)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi server: {str(e)}"
        }), 500