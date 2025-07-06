from config.database import db
from datetime import datetime, timedelta

class Habit(db.Model):
    __tablename__ = 'habits'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    frequency = db.Column(db.String(20), nullable=False)  # daily, weekly, monthly
    reminder_time = db.Column(db.Time)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    last_completed = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    completions = db.relationship('HabitCompletion', backref='habit', lazy=True, cascade='all, delete-orphan')
    
    def complete(self):
        """Mark the habit as completed for today"""
        today = datetime.utcnow().date()
        
        # Check if already completed today
        if self.last_completed and self.last_completed.date() == today:
            return False
        
        # Create completion record
        completion = HabitCompletion(habit_id=self.id, completed_at=datetime.utcnow())
        db.session.add(completion)
        
        # Update streak
        if self.last_completed:
            yesterday = (datetime.utcnow() - timedelta(days=1)).date()
            if self.last_completed.date() == yesterday:
                self.current_streak += 1
            else:
                self.current_streak = 1
        else:
            self.current_streak = 1
        
        # Update longest streak
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        self.last_completed = datetime.utcnow()
        db.session.commit()
        return True
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'frequency': self.frequency,
            'reminder_time': self.reminder_time.isoformat() if self.reminder_time else None,
            'created_at': self.created_at.isoformat(),
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'last_completed': self.last_completed.isoformat() if self.last_completed else None,
            'is_active': self.is_active
        }

class HabitCompletion(db.Model):
    __tablename__ = 'habit_completions'
    
    id = db.Column(db.Integer, primary_key=True)
    habit_id = db.Column(db.Integer, db.ForeignKey('habits.id'), nullable=False)
    completed_at = db.Column(db.DateTime, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'habit_id': self.habit_id,
            'completed_at': self.completed_at.isoformat()
        } 