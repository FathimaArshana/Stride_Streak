from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.notification import Notification
from models.user import User
from models.habit import Habit
from config.database import db, mail
from flask_mail import Message
from datetime import datetime, timedelta
import os

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    
    return jsonify({
        'notifications': [notification.to_dict() for notification in notifications]
    }), 200

@notifications_bp.route('/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    notification.mark_as_read()
    return jsonify({'message': 'Notification marked as read'}), 200

@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_notifications_read():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id, read_at=None).all()
    
    for notification in notifications:
        notification.mark_as_read()
    
    return jsonify({'message': 'All notifications marked as read'}), 200

def send_email_notification(user, subject, message):
    """Helper function to send email notifications"""
    if not user.notification_preferences.get('email', True):
        return False
    
    try:
        msg = Message(
            subject=subject,
            recipients=[user.email],
            body=message,
            sender=os.getenv('MAIL_USERNAME')
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def create_notification(user_id, title, message, notification_type='both'):
    """Helper function to create a notification record"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type
    )
    
    try:
        db.session.add(notification)
        db.session.commit()
        
        # Send email if notification type includes email
        if 'email' in notification_type:
            user = User.query.get(user_id)
            send_email_notification(user, title, message)
        
        # TODO: Implement push notification sending using Firebase Cloud Messaging
        
        notification.mark_as_sent()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Error creating notification: {str(e)}")
        return False

@notifications_bp.route('/reminders', methods=['POST'])
@jwt_required()
def send_reminders():
    """Endpoint to send reminders for habits due today"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get active habits that need reminders
    now = datetime.utcnow()
    today = now.date()
    
    habits = Habit.query.filter_by(
        user_id=user_id,
        is_active=True
    ).all()
    
    reminders_sent = 0
    for habit in habits:
        # Skip if habit was already completed today
        if habit.last_completed and habit.last_completed.date() == today:
            continue
        
        # Check if it's time to send a reminder based on frequency
        should_remind = False
        if habit.frequency == 'daily':
            should_remind = True
        elif habit.frequency == 'weekly' and today.weekday() == 0:  # Monday
            should_remind = True
        elif habit.frequency == 'monthly' and today.day == 1:
            should_remind = True
        
        if should_remind:
            # Create reminder notification
            title = f"Reminder: {habit.title}"
            message = f"Don't forget to complete your habit: {habit.title}"
            
            if create_notification(user_id, title, message, 'both'):
                reminders_sent += 1
    
    return jsonify({
        'message': f'Reminders sent successfully',
        'reminders_sent': reminders_sent
    }), 200

@notifications_bp.route('/achievements', methods=['POST'])
@jwt_required()
def check_achievements():
    """Endpoint to check and notify users of achievements"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    achievements = []
    
    # Check level up
    new_level = (user.points // 1000) + 1
    if new_level > user.level:
        user.level = new_level
        achievements.append({
            'title': f'Level Up! 🎉',
            'message': f'Congratulations! You\'ve reached level {new_level}!'
        })
    
    # Check streak achievements
    habits = Habit.query.filter_by(user_id=user_id).all()
    for habit in habits:
        if habit.current_streak == 7:
            achievements.append({
                'title': 'Week Streak! 🌟',
                'message': f'You\'ve maintained {habit.title} for 7 days straight!'
            })
        elif habit.current_streak == 30:
            achievements.append({
                'title': 'Month Master! 🏆',
                'message': f'Incredible! You\'ve kept up {habit.title} for 30 days!'
            })
    
    # Send notifications for achievements
    notifications_sent = 0
    for achievement in achievements:
        if create_notification(user_id, achievement['title'], achievement['message'], 'both'):
            notifications_sent += 1
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Achievements checked successfully',
            'achievements_found': len(achievements),
            'notifications_sent': notifications_sent
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 