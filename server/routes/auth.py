from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from config.database import db
from datetime import datetime
import re

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate request data
    if not data:
        return jsonify({
            'error': 'No data provided',
            'message': 'Please provide registration details'
        }), 400
    
    # Extract and validate fields
    email = data.get('email', '').strip()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    # Check for missing fields
    missing_fields = []
    if not email:
        missing_fields.append('email')
    if not username:
        missing_fields.append('username')
    if not password:
        missing_fields.append('password')
    
    if missing_fields:
        return jsonify({
            'error': 'Missing required fields',
            'message': f'Please provide: {", ".join(missing_fields)}',
            'missing_fields': missing_fields
        }), 400
    
    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return jsonify({
            'error': 'Invalid email format',
            'message': 'Please enter a valid email address'
        }), 400
    
    # Validate username
    if len(username) < 3:
        return jsonify({
            'error': 'Username too short',
            'message': 'Username must be at least 3 characters long'
        }), 400
    
    if len(username) > 20:
        return jsonify({
            'error': 'Username too long',
            'message': 'Username must be 20 characters or less'
        }), 400
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return jsonify({
            'error': 'Invalid username format',
            'message': 'Username can only contain letters, numbers, and underscores'
        }), 400
    
    # Validate password
    if len(password) < 8:
        return jsonify({
            'error': 'Password too weak',
            'message': 'Password must be at least 8 characters long'
        }), 400
    
    # Check if user already exists
    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        print(f"Registration attempt with existing email: {email}")
        return jsonify({
            'error': 'Email already registered',
            'message': 'An account with this email already exists. Please try logging in instead.',
            'suggestion': 'login'
        }), 400
    
    existing_username = User.query.filter_by(username=username).first()
    if existing_username:
        print(f"Registration attempt with existing username: {username}")
        return jsonify({
            'error': 'Username already taken',
            'message': 'This username is already taken. Please choose a different one.'
        }), 400
    
    # Create new user
    try:
        user = User(
            email=email,
            username=username
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        # Log successful registration
        print(f"Successful registration for user: {email} ({username})")
        
        return jsonify({
            'message': 'Account created successfully! Welcome to StrideStreak!',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error for {email}: {str(e)}")
        return jsonify({
            'error': 'Registration failed',
            'message': 'An error occurred while creating your account. Please try again.',
            'details': str(e)
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate request data
    if not data:
        return jsonify({
            'error': 'No data provided',
            'message': 'Please provide login credentials'
        }), 400
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({
            'error': 'Missing credentials',
            'message': 'Please provide both email and password'
        }), 400
    
    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return jsonify({
            'error': 'Invalid email format',
            'message': 'Please enter a valid email address'
        }), 400
    
    # Look up user
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # Log for debugging (server-side only)
        print(f"Login attempt with unregistered email: {email}")
        return jsonify({
            'error': 'Account not found',
            'message': 'No account found with this email address. Please check your email or sign up for a new account.',
            'suggestion': 'register'
        }), 401
    
    # Check password
    if not user.check_password(password):
        # Log for debugging (server-side only)
        print(f"Failed login attempt for user: {email} - incorrect password")
        return jsonify({
            'error': 'Invalid password',
            'message': 'The password you entered is incorrect. Please try again.',
            'suggestion': 'reset_password'
        }), 401
    
    try:
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        # Log successful login
        print(f"Successful login for user: {email}")
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Login error for user {email}: {str(e)}")
        return jsonify({
            'error': 'Login failed',
            'message': 'An error occurred during login. Please try again.',
            'details': str(e)
        }), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if 'username' in data:
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({'error': 'Username already taken'}), 400
        user.username = data['username']
    
    if 'email' in data:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({'error': 'Email already registered'}), 400
        user.email = data['email']
    
    if 'notification_preferences' in data:
        user.notification_preferences = data['notification_preferences']
    
    if 'password' in data:
        user.set_password(data['password'])
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Delete all user's habits and related data
        from models.habit import Habit
        from models.notification import Notification
        from models.todo import Todo
        
        # Delete habits using ORM to trigger cascade behavior for habit_completions
        user_habits = Habit.query.filter_by(user_id=user_id).all()
        for habit in user_habits:
            db.session.delete(habit)  # This will cascade to habit_completions
        
        # Delete user's notifications
        Notification.query.filter_by(user_id=user_id).delete()
        
        # Delete user's todos
        Todo.query.filter_by(user_id=user_id).delete()
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Account deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 