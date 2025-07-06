# Stride Streak - Habit Tracking Application

A full-stack habit tracking application that helps users build and maintain positive habits through streak tracking, calendar views, and progress analytics.

## 🚀 Features

- **User Authentication** - Secure registration and login system
- **Habit Management** - Create, edit, and track daily habits
- **Streak Tracking** - Monitor current and longest streaks
- **Calendar View** - Visual habit completion calendar
- **Progress Analytics** - Statistics and progress overview
- **Todo Lists** - Task management alongside habits
- **Notifications** - Reminders for habit completion
- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **React Router** - Navigation
- **React Hook Form** - Form management
- **Tanstack Query** - Data fetching
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **date-fns** - Date utilities

### Backend
- **Python 3.8+** - Server language
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **MySQL** - Database
- **JWT** - Authentication
- **Flask-Mail** - Email notifications
- **bcrypt** - Password hashing
- **Flask-CORS** - Cross-origin requests

## 📁 Project Structure

```
stride-streak-hub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── AddHabitForm.tsx
│   │   │   ├── HabitCalendar.tsx
│   │   │   ├── HabitCard.tsx
│   │   │   └── ...
│   │   ├── pages/         # Route components
│   │   ├── context/       # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── ...
└── server/                # Flask backend
    ├── models/            # Database models
    │   ├── user.py
    │   ├── habit.py
    │   ├── todo.py
    │   └── notification.py
    ├── routes/            # API routes
    │   ├── auth.py
    │   ├── habits.py
    │   ├── todos.py
    │   └── notifications.py
    ├── app.py             # Flask application
    ├── config.py          # Configuration
    └── requirements.txt   # Python dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 16+** and npm
- **Python 3.8+** and pip
- **MySQL** (via XAMPP or standalone)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd stride-streak-hub
   ```

2. **Set up Python environment**
   ```bash
   cd server
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up MySQL database**
   - Start XAMPP and ensure MySQL is running
   - Create database named `habit_tracker`
   - Run the setup script:
   ```bash
   python setup_database.py
   ```

5. **Create environment file**
   ```bash
   # Create .env file in server directory
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-here
   DATABASE_URL=mysql+pymysql://root:@localhost/habit_tracker
   ```

6. **Start the Flask server**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd ../client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`

## 📊 Database Schema

### Users
- User authentication and profile information
- Points and level system
- Notification preferences

### Habits
- Habit details and configuration
- Streak tracking (current and longest)
- Frequency settings (daily/weekly/monthly)
- Reminder times

### Habit Completions
- Individual completion records
- Date/time tracking

### Todos
- Task management
- Priority and due dates
- Categories

### Notifications
- Email and push notifications
- Status tracking

## 🔧 Available Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
python app.py              # Start Flask server
python setup_database.py   # Set up database
pytest                     # Run tests
black .                    # Format code
flake8 .                   # Lint code
```

## 🌟 Key Features Explained

### Habit Tracking
- Create habits with custom titles and descriptions
- Set reminder times and frequencies
- Track daily completions
- View streak progress

### Calendar Integration
- Visual representation of habit completions
- Monthly and yearly views
- Quick completion marking

### Progress Analytics
- Streak statistics
- Completion rates
- Progress charts and graphs
- Level and points system

### User Experience
- Intuitive interface with modern design
- Responsive layout for all devices
- Dark/light theme support
- Smooth animations and transitions

## 🔐 Authentication

The app uses JWT-based authentication with:
- Secure password hashing (bcrypt)
- Protected routes
- Token refresh mechanism
- User session management

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Habits
- `GET /api/habits` - Get user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Mark habit complete

### Todos
- `GET /api/todos` - Get user todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## 🔄 Development Workflow

1. **Make changes** to frontend or backend code
2. **Test locally** using development servers
3. **Run linting** and formatting tools
4. **Test API endpoints** using curl or Postman
5. **Check database** via phpMyAdmin
6. **Build for production** when ready

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to static hosting
```

### Backend
```bash
# Use gunicorn for production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
- Ensure MySQL is running in XAMPP
- Check database credentials in .env file
- Verify database `habit_tracker` exists

**Frontend Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

**API CORS Issues**
- Ensure Flask-CORS is installed and configured
- Check API base URL in frontend configuration

For detailed database setup instructions, see `server/DATABASE_SETUP.md`.
