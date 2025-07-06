from config.database import db
from datetime import datetime
import bcrypt

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    points = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    notification_preferences = db.Column(db.JSON, default={
        'email': True,
        'push': True
    })
    
    # Relationships
    habits = db.relationship('Habit', backref='user', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)
    todos = db.relationship('Todo', back_populates='user', lazy=True)
    
    def set_password(self, password):
        salt = bcrypt.gensalt()
        # Store as string (decode bytes to string for database storage)
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        # Convert stored string back to bytes for bcrypt comparison
        stored_hash = self.password_hash.encode('utf-8') if isinstance(self.password_hash, str) else self.password_hash
        return bcrypt.checkpw(password.encode('utf-8'), stored_hash)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'points': self.points,
            'level': self.level,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'notification_preferences': self.notification_preferences
        } 