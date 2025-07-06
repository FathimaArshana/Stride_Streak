# Database Setup Guide for Habit Tracker

This guide will help you set up the MySQL database for the Habit Tracker application using XAMPP and phpMyAdmin.

## Prerequisites

1. **XAMPP installed** with MySQL enabled
2. **Python 3.8+** installed
3. **Virtual environment** activated

## Step 1: Start XAMPP

1. Open XAMPP Control Panel
2. Start **Apache** (for phpMyAdmin)
3. Start **MySQL** (for database)
4. Verify both services are running (green status)

## Step 2: Install Python Dependencies

```bash
cd server
pip install -r requirements.txt
```

## Step 3: Set Up Database

### Option A: Automatic Setup (Recommended)

Run the database setup script:

```bash
python setup_database.py
```

This will:
- Create the `habit_tracker` database
- Create all necessary tables
- Display success confirmation

### Option B: Manual Setup via phpMyAdmin

1. Open phpMyAdmin at `http://localhost/phpmyadmin/`
2. Click "New" to create a new database
3. Name it `habit_tracker`
4. Set collation to `utf8mb4_unicode_ci`
5. Click "Create"

Then run the Flask app to create tables:

```bash
python app.py
```

## Step 4: Verify Database Setup

1. Go to `http://localhost/phpmyadmin/`
2. Click on `habit_tracker` database
3. You should see these tables:
   - `users`
   - `habits`
   - `habit_completions`
   - `notifications`

## Step 5: Test the API

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```

3. You should see:
   ```json
   {
     "status": "healthy",
     "message": "Habit Tracker API is running"
   }
   ```

## Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `username` (Unique)
- `password_hash`
- `points`
- `level`
- `notification_preferences` (JSON)
- `created_at`
- `last_login`

### Habits Table
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `title`
- `description`
- `frequency` (daily/weekly/monthly)
- `reminder_time`
- `current_streak`
- `longest_streak`
- `last_completed`
- `is_active`
- `created_at`

### Habit Completions Table
- `id` (Primary Key)
- `habit_id` (Foreign Key to habits)
- `completed_at`

### Notifications Table
- `id` (Primary Key)
- `user_id` (Foreign Key to users)
- `title`
- `message`
- `type` (email/push/both)
- `status` (pending/sent/failed)
- `created_at`
- `sent_at`
- `read_at`

## Troubleshooting

### Common Issues

1. **"Access denied for user 'root'@'localhost'"**
   - Make sure MySQL is running in XAMPP
   - Check if password is required (default is empty)

2. **"Database 'habit_tracker' doesn't exist"**
   - Run the setup script: `python setup_database.py`
   - Or create manually via phpMyAdmin

3. **"No module named 'pymysql'"**
   - Install dependencies: `pip install -r requirements.txt`

4. **Connection timeout**
   - Ensure XAMPP MySQL is running
   - Check firewall settings
   - Verify port 3306 is available

### Environment Configuration

Create a `.env` file in the `server` directory:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
DATABASE_URL=mysql+pymysql://root:@localhost/habit_tracker
```

## Testing User Registration

Once everything is set up:

1. Start the backend: `python app.py`
2. Start the frontend: `cd ../client && npm run dev`
3. Go to `http://localhost:5173/register`
4. Create a test account
5. Check phpMyAdmin to see the new user in the `users` table

The user data should now be saved in your MySQL database accessible via phpMyAdmin! 