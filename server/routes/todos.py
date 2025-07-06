from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config.database import db
from models.todo import Todo
from models.user import User
from datetime import datetime

todos_bp = Blueprint('todos', __name__)

@todos_bp.route('/todos', methods=['GET'])
@jwt_required()
def get_todos():
    """Get all todos for the current user"""
    try:
        user_id = get_jwt_identity()
        
        # Get all todos for the user, ordered by creation date (newest first)
        todos = Todo.query.filter_by(user_id=user_id).order_by(Todo.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'todos': [todo.to_dict() for todo in todos]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching todos: {str(e)}'
        }), 500

@todos_bp.route('/todos', methods=['POST'])
@jwt_required()
def create_todo():
    """Create a new todo"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('text'):
            return jsonify({
                'success': False,
                'message': 'Todo text is required'
            }), 400
        
        # Create new todo
        todo = Todo(
            user_id=user_id,
            text=data['text'].strip(),
            completed=data.get('completed', False)
        )
        
        db.session.add(todo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Todo created successfully',
            'todo': todo.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error creating todo: {str(e)}'
        }), 500

@todos_bp.route('/todos/<int:todo_id>', methods=['PUT'])
@jwt_required()
def update_todo(todo_id):
    """Update a todo"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Find the todo and ensure it belongs to the current user
        todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
        
        if not todo:
            return jsonify({
                'success': False,
                'message': 'Todo not found'
            }), 404
        
        # Update todo fields
        if 'text' in data:
            if not data['text'].strip():
                return jsonify({
                    'success': False,
                    'message': 'Todo text cannot be empty'
                }), 400
            todo.text = data['text'].strip()
        
        if 'completed' in data:
            todo.completed = bool(data['completed'])
        
        todo.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Todo updated successfully',
            'todo': todo.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error updating todo: {str(e)}'
        }), 500

@todos_bp.route('/todos/<int:todo_id>', methods=['DELETE'])
@jwt_required()
def delete_todo(todo_id):
    """Delete a todo"""
    try:
        user_id = get_jwt_identity()
        
        # Find the todo and ensure it belongs to the current user
        todo = Todo.query.filter_by(id=todo_id, user_id=user_id).first()
        
        if not todo:
            return jsonify({
                'success': False,
                'message': 'Todo not found'
            }), 404
        
        db.session.delete(todo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Todo deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error deleting todo: {str(e)}'
        }), 500

@todos_bp.route('/todos/stats', methods=['GET'])
@jwt_required()
def get_todo_stats():
    """Get todo statistics for the current user"""
    try:
        user_id = get_jwt_identity()
        
        total_todos = Todo.query.filter_by(user_id=user_id).count()
        completed_todos = Todo.query.filter_by(user_id=user_id, completed=True).count()
        pending_todos = total_todos - completed_todos
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total_todos,
                'completed': completed_todos,
                'pending': pending_todos
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching todo stats: {str(e)}'
        }), 500 