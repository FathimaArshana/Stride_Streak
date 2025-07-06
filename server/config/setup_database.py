#!/usr/bin/env python3
"""
Automatic Database Setup for Habit Tracker
This script will create the database and all tables automatically
"""
import sys
import os
import pymysql
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError

# This script is called from the server directory, so imports work normally

def create_database():
    """Create the database if it doesn't exist"""
    print("🔍 Checking database connection...")
    
    # Connection without database to create it
    try:
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='',  # Default XAMPP password is empty
            charset='utf8mb4'
        )
        
        print("✅ Connected to MySQL server")
        
        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute("CREATE DATABASE IF NOT EXISTS habit_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print("✅ Database 'habit_tracker' created/verified")
            
            # Show databases to confirm
            cursor.execute("SHOW DATABASES")
            databases = [db[0] for db in cursor.fetchall()]
            if 'habit_tracker' in databases:
                print("✅ Database exists in MySQL")
            else:
                print("❌ Database creation failed")
                return False
                
        connection.commit()
        connection.close()
        
        # Add a small delay to ensure database creation is fully committed
        import time
        time.sleep(1)
        print("✅ Database creation completed")
        return True
        
    except pymysql.Error as e:
        print(f"❌ MySQL Connection Error: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure XAMPP is running")
        print("   2. Start Apache and MySQL in XAMPP Control Panel")
        print("   3. Check if MySQL is running on port 3306")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def create_tables():
    """Create all application tables"""
    print("\n🔨 Creating application tables...")
    
    try:
        from flask import Flask
        from config.config import Config
        from config.database import db
        
        # Initialize Flask app and database
        app = Flask(__name__)
        app.config.from_object(Config)
        
        db.init_app(app)
        
        with app.app_context():
            # Test database connection first
            try:
                db.session.execute(text("SELECT 1"))
                print("✅ Connected to habit_tracker database")
            except Exception as conn_error:
                print(f"❌ Failed to connect to database: {conn_error}")
                return False
            
            # Import all models to register them
            from models.user import User
            from models.habit import Habit, HabitCompletion
            from models.notification import Notification
            from models.todo import Todo
            
            print("📋 Creating tables:")
            print("   - users")
            print("   - habits")
            print("   - habit_completions")
            print("   - notifications")
            print("   - todos")
            
            # Create all tables
            db.create_all()
            
            # Verify tables were created
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            
            expected_tables = ['users', 'habits', 'habit_completions', 'notifications', 'todos']
            created_tables = []
            missing_tables = []
            
            for table in expected_tables:
                if table in tables:
                    created_tables.append(table)
                    print(f"   ✅ {table}")
                else:
                    missing_tables.append(table)
                    print(f"   ❌ {table}")
            
            if missing_tables:
                print(f"\n⚠️  Missing tables: {missing_tables}")
                return False
            else:
                print(f"\n✅ All {len(created_tables)} tables created successfully!")
                return True
                
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("Make sure all required packages are installed: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database_connection():
    """Test the database connection with the application"""
    print("\n🧪 Testing database connection...")
    
    try:
        from flask import Flask
        from config.config import Config
        from config.database import db
        
        app = Flask(__name__)
        app.config.from_object(Config)
        
        db.init_app(app)
        
        with app.app_context():
            # Test connection by executing a simple query
            result = db.session.execute(text("SELECT 1")).fetchone()
            if result:
                print("✅ Database connection test passed")
                
                # Show table info
                from sqlalchemy import inspect
                inspector = inspect(db.engine)
                tables = inspector.get_table_names()
                print(f"📊 Found {len(tables)} tables: {', '.join(tables)}")
                return True
            else:
                print("❌ Database connection test failed")
                return False
                
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

def setup_database():
    """Main setup function"""
    print("🚀 Starting Habit Tracker Database Setup")
    print("=" * 50)
    
    # Step 1: Create database
    if not create_database():
        print("\n❌ Database setup failed!")
        return False
    
    # Step 2: Create tables
    if not create_tables():
        print("\n❌ Table creation failed!")
        return False
    
    # Step 3: Test connection
    if not test_database_connection():
        print("\n❌ Database test failed!")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 Database setup completed successfully!")
    print("🚀 Your Habit Tracker is ready to run!")
    print("=" * 50)
    return True

if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1) 