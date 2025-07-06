from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.habit import Habit, HabitCompletion
from models.user import User
from config.database import db
from datetime import datetime, timedelta

habits_bp = Blueprint('habits', __name__)

@habits_bp.route('', methods=['POST'])
@jwt_required()
def create_habit():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'frequency']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate frequency
    if data['frequency'] not in ['daily', 'weekly', 'monthly']:
        return jsonify({'error': 'Invalid frequency'}), 400
    
    # Create new habit
    reminder_time = None
    if 'reminder_time' in data:
        try:
            # Try parsing with seconds first
            reminder_time = datetime.strptime(data['reminder_time'], '%H:%M:%S').time()
        except ValueError:
            # Fall back to parsing without seconds
            reminder_time = datetime.strptime(data['reminder_time'], '%H:%M').time()
    
    habit = Habit(
        user_id=user_id,
        title=data['title'],
        description=data.get('description', ''),
        frequency=data['frequency'],
        reminder_time=reminder_time
    )
    
    try:
        db.session.add(habit)
        db.session.commit()
        return jsonify({
            'message': 'Habit created successfully',
            'habit': habit.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@habits_bp.route('', methods=['GET'])
@jwt_required()
def get_habits():
    user_id = get_jwt_identity()
    habits = Habit.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'habits': [habit.to_dict() for habit in habits]
    }), 200

@habits_bp.route('/<int:habit_id>', methods=['GET'])
@jwt_required()
def get_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    return jsonify(habit.to_dict()), 200

@habits_bp.route('/<int:habit_id>', methods=['PUT'])
@jwt_required()
def update_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if 'title' in data:
        habit.title = data['title']
    if 'description' in data:
        habit.description = data['description']
    if 'frequency' in data:
        if data['frequency'] not in ['daily', 'weekly', 'monthly']:
            return jsonify({'error': 'Invalid frequency'}), 400
        habit.frequency = data['frequency']
    if 'reminder_time' in data:
        if data['reminder_time'] is None or data['reminder_time'] == '':
            # Clear the reminder time (delete reminder)
            habit.reminder_time = None
        else:
            try:
                # Try parsing with seconds first
                habit.reminder_time = datetime.strptime(data['reminder_time'], '%H:%M:%S').time()
            except ValueError:
                # Fall back to parsing without seconds
                habit.reminder_time = datetime.strptime(data['reminder_time'], '%H:%M').time()
    if 'is_active' in data:
        habit.is_active = data['is_active']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Habit updated successfully',
            'habit': habit.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@habits_bp.route('/<int:habit_id>', methods=['DELETE'])
@jwt_required()
def delete_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    try:
        # First delete all related habit completions
        HabitCompletion.query.filter_by(habit_id=habit_id).delete()
        
        # Then delete the habit
        db.session.delete(habit)
        db.session.commit()
        return jsonify({'message': 'Habit deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@habits_bp.route('/<int:habit_id>/complete', methods=['POST'])
@jwt_required()
def complete_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    
    if not habit:
        return jsonify({'error': 'Habit not found'}), 404
    
    if not habit.is_active:
        return jsonify({'error': 'Habit is not active'}), 400
    
    if habit.complete():
        # Award points based on streak
        user = User.query.get(user_id)
        points_earned = min(habit.current_streak * 10, 100)  # Cap at 100 points
        user.points += points_earned
        
        # Level up if enough points
        new_level = (user.points // 1000) + 1
        if new_level > user.level:
            user.level = new_level
        
        try:
            db.session.commit()
            return jsonify({
                'message': 'Habit completed successfully',
                'habit': habit.to_dict(),
                'points_earned': points_earned,
                'total_points': user.points,
                'level': user.level
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Habit already completed today'}), 400

@habits_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_habits_stats():
    user_id = get_jwt_identity()
    habits = Habit.query.filter_by(user_id=user_id).all()
    
    total_habits = len(habits)
    active_habits = len([h for h in habits if h.is_active])
    total_streaks = sum(h.current_streak for h in habits)
    longest_streak = max((h.longest_streak for h in habits), default=0)
    
    # Get completion rate for the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    completions = HabitCompletion.query.join(Habit).filter(
        Habit.user_id == user_id,
        HabitCompletion.completed_at >= thirty_days_ago
    ).count()
    
    total_possible_completions = sum(
        30 if h.frequency == 'daily' else
        4 if h.frequency == 'weekly' else
        1 for h in habits if h.is_active
    )
    
    completion_rate = (completions / total_possible_completions * 100) if total_possible_completions > 0 else 0
    
    return jsonify({
        'total_habits': total_habits,
        'active_habits': active_habits,
        'total_streaks': total_streaks,
        'longest_streak': longest_streak,
        'completion_rate_30d': round(completion_rate, 2)
    }), 200 