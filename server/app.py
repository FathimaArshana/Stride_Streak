from flask import Flask, jsonify
from flask_cors import CORS
from config.config import Config
from config.database import db, jwt, mail
import sys
import os
import logging
import time

def setup_database_automatically():
    """Automatically setup database and tables"""
    print("🔍 Checking database setup...")
    
    try:
        # Try to import and run the setup
        from config.setup_database import setup_database
        return setup_database()
    except Exception as e:
        print(f"⚠️  Database auto-setup failed: {e}")
        print("💡 You may need to run setup_database.py manually")
        return False

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Initialize extensions with app - Allow multiple frontend ports
    CORS(app, origins=[
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # React default
        "http://localhost:8080",  # Vue/other frameworks
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:8080"
    ])
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    
    # Import models to ensure they are registered
    from models.user import User
    from models.habit import Habit, HabitCompletion
    from models.notification import Notification
    from models.todo import Todo
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.habits import habits_bp
    from routes.notifications import notifications_bp
    from routes.todos import todos_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(habits_bp, url_prefix='/api/habits')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(todos_bp, url_prefix='/api')
    
    # Setup database with app context
    with app.app_context():
        try:
            # Test if database exists first
            from sqlalchemy import text
            db.session.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            
            # Now try to create tables
            db.create_all()
            print("✅ Database tables verified/created successfully!")
            
        except Exception as e:
            error_msg = str(e).lower()
            print(f"⚠️  Database connection/tables creation failed: {e}")
            
            # Check if it's a database connection issue (database doesn't exist)
            if "unknown database" in error_msg or "database" in error_msg or "connection" in error_msg:
                print("🔧 Database doesn't exist. Creating database and tables...")
                
                # Run full database setup
                if setup_database_automatically():
                    print("✅ Database setup completed! Creating tables in new app context...")
                    
                    # Create a fresh app context after database creation
                    try:
                        # Dispose of existing connections
                        db.engine.dispose()
                        
                        # Test connection again
                        db.session.execute(text("SELECT 1"))
                        print("✅ Database connection verified")
                        
                        # Create tables
                        db.create_all()
                        print("✅ All tables created successfully!")
                        
                        # Verify table creation
                        from sqlalchemy import inspect
                        inspector = inspect(db.engine)
                        tables = inspector.get_table_names()
                        print(f"✅ Verified {len(tables)} tables: {', '.join(tables)}")
                        
                    except Exception as retry_error:
                        print(f"❌ Table creation still failed: {retry_error}")
                        print("💡 Please check your XAMPP/MySQL configuration")
                else:
                    print("❌ Automatic database setup failed")
                    print("💡 Please run 'python setup_database.py' manually")
            else:
                print("❌ Unexpected database error")
                print("💡 Please check your XAMPP/MySQL configuration")
    
    @app.route('/api/health')
    def health_check():
        """Health check endpoint with database status"""
        try:
            # Test database connection
            with app.app_context():
                from sqlalchemy import text
                db.session.execute(text("SELECT 1"))
                
                # Also check if tables exist
                from sqlalchemy import inspect
                inspector = inspect(db.engine)
                tables = inspector.get_table_names()
                
            return {
                'status': 'healthy', 
                'message': 'Habit Tracker API is running',
                'database': 'connected',
                'tables': len(tables),
                'table_names': tables
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'message': 'Habit Tracker API is running but database connection failed',
                'database': 'disconnected',
                'error': str(e)
            }, 500
    
    return app

if __name__ == '__main__':
    print("🚀 Starting Habit Tracker API...")
    print("=" * 50)
    print("📋 Prerequisites:")
    print("   1. XAMPP is running")
    print("   2. MySQL service is started")
    print("   3. Port 3306 is available")
    print("=" * 50)
    
    app = create_app()
    
    print("\n🌐 API will be available at:")
    print("   - Health Check: http://localhost:5000/api/health")
    print("   - Auth: http://localhost:5000/api/auth/*")
    print("   - Habits: http://localhost:5000/api/habits/*")
    print("   - Todos: http://localhost:5000/api/todos/*")
    print("   - Notifications: http://localhost:5000/api/notifications/*")
    print("\n🎯 Starting server...")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
