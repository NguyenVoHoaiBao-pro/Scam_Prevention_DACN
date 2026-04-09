from flask import Blueprint, request, jsonify
from app.models.report import Report, db
import os
import datetime

report_bp = Blueprint('report', __name__)

# Tạo report mới
@report_bp.route('/api/report', methods=['POST'])
def create_report():
	data = request.form
	file = request.files.get('evidence')

	report = Report(
		title=data.get('title'),
		description=data.get('description'),
		scam_type=data.get('scam_type'),
		reporter_name=data.get('reporter_name'),
		email=data.get('email'),
	)

	# Lưu file minh chứng nếu có
	if file:
		upload_folder = 'uploads'
		os.makedirs(upload_folder, exist_ok=True)
		filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
		filepath = os.path.join(upload_folder, filename)
		file.save(filepath)
		report.evidence = filepath

	db.session.add(report)
	db.session.commit()
	return jsonify(report.to_dict()), 201

# Lấy danh sách report
@report_bp.route('/api/reports', methods=['GET'])
def get_reports():
	reports = Report.query.order_by(Report.created_at.desc()).all()
	return jsonify([r.to_dict() for r in reports])
