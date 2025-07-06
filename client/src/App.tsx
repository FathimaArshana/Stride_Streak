import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

// Lazy load pages
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Habits = React.lazy(() => import('./pages/Habits'));
const Todo = React.lazy(() => import('./pages/Todo'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Profile = React.lazy(() => import('./pages/Profile'));

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
    </div>
);

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    
    // Don't show navigation on login/register pages
    const showNavigation = user && !['/login', '/register'].includes(location.pathname);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
            {showNavigation && <Navigation />}
            <div className={showNavigation ? "pt-16" : ""}>
                <Suspense fallback={<LoadingSpinner />}>
        <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/habits"
                        element={
                            <ProtectedRoute>
                                <Habits />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/todo"
                        element={
                            <ProtectedRoute>
                                <Todo />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/calendar"
                        element={
                            <ProtectedRoute>
                                <Calendar />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
            </Suspense>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </Router>
);
};

export default App;
