from app import db

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    due_date = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="Pending")  # 'Pending' or 'Completed'
