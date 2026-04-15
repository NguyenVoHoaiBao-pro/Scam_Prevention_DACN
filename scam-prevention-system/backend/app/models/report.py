# from ... import db nếu dùng Flask app factory, ở đây import trực tiếp
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Report(db.Model):
	__tablename__ = 'reports'
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.String(255), nullable=False)
	description = db.Column(db.Text, nullable=False)
	scam_type = db.Column(db.String(100), nullable=True)
	reporter_name = db.Column(db.String(100), nullable=True)
	email = db.Column(db.String(100), nullable=True)
	created_at = db.Column(db.DateTime, default=datetime.utcnow)
	evidence = db.Column(db.String(255), nullable=True)

	def to_dict(self):
		return {
			"id": self.id,
			"title": self.title,
			"description": self.description,
			"scam_type": self.scam_type,
			"reporter_name": self.reporter_name,
			"email": self.email,
			"created_at": self.created_at.isoformat() if self.created_at else None,
			"evidence": self.evidence
		}
