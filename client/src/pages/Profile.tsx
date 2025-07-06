import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService, habitService } from '../services/api';
import type { UpdateProfileRequest } from '../types/api';
import { 
    UserIcon, 
    EnvelopeIcon, 
    KeyIcon, 
    BellIcon, 
    ShieldCheckIcon,
    TrashIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    CalendarIcon,
    FireIcon,
    TrophyIcon,
    ChartBarIcon,
    ClockIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface UserStats {
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    longestStreak: number;
    totalPoints: number;
    level: number;
    joinedDays: number;
}

const Profile: React.FC = () => {
    const { user, updateProfile, logout } = useAuth();
    const { theme } = useTheme();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'danger'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form states
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [notificationData, setNotificationData] = useState({
        email: user?.notification_preferences?.email ?? true,
        push: user?.notification_preferences?.push ?? true,
        reminder_time: user?.notification_preferences?.reminder_time || '09:00',
    });

    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    useEffect(() => {
        fetchUserStats();
    }, []);

    useEffect(() => {
        // Check for tab parameter in URL
        const urlParams = new URLSearchParams(location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['profile', 'security', 'notifications', 'danger'].includes(tabParam)) {
            setActiveTab(tabParam as 'profile' | 'security' | 'notifications' | 'danger');
        }
    }, [location.search]);

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || '',
            });
            setNotificationData({
                email: user.notification_preferences?.email ?? true,
                push: user.notification_preferences?.push ?? true,
                reminder_time: user.notification_preferences?.reminder_time || '09:00',
            });
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            const habits = await habitService.getHabits();
            const stats = await habitService.getStats();
            
            const joinedDate = new Date(user?.created_at || Date.now());
            const today = new Date();
            const joinedDays = Math.floor((today.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

            setUserStats({
                totalHabits: stats?.total_habits || 0,
                activeHabits: stats?.active_habits || 0,
                completedToday: habits?.filter(h => {
                    if (!h.last_completed) return false;
                    const today = new Date().toDateString();
                    const lastCompleted = new Date(h.last_completed).toDateString();
                    return today === lastCompleted;
                }).length || 0,
                longestStreak: stats?.longest_streak || 0,
                totalPoints: user?.points || 0,
                level: user?.level || 1,
                joinedDays: Math.max(joinedDays, 0)
            });
        } catch (err) {
            console.error('Failed to fetch user stats:', err);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedData: UpdateProfileRequest = {};
            if (profileData.username !== user?.username) {
                updatedData.username = profileData.username;
            }
            if (profileData.email !== user?.email) {
                updatedData.email = profileData.email;
            }
            
            if (Object.keys(updatedData).length > 0) {
                await updateProfile(updatedData);
                setSuccess('Profile updated successfully');
            } else {
                setSuccess('No changes to save');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setIsLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        try {
            await updateProfile({ 
                password: passwordData.newPassword 
            });
            setSuccess('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordFields(false);
        } catch (err: any) {
            setError(err.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await updateProfile({
                notification_preferences: notificationData
            });
            setSuccess('Notification preferences updated successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to update notification preferences');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            setError('Please type "DELETE" to confirm account deletion');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await authService.deleteAccount();
            logout();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to delete account');
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const tabs = [
        { id: 'profile', name: 'Profile Info', icon: UserIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'danger', name: 'Danger Zone', icon: TrashIcon },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                        Manage your profile, security, and preferences
                    </p>
                </div>

                {/* User Overview Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username}</h2>
                            <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                    Level {user?.level}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                    {user?.points} Points
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                    Member since {formatDate(user?.created_at || '')}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        {userStats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                        <ChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{userStats.totalHabits}</div>
                                    <div className="text-xs text-blue-700 dark:text-blue-300">Total Habits</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{userStats.completedToday}</div>
                                    <div className="text-xs text-green-700 dark:text-green-300">Today</div>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                        <FireIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{userStats.longestStreak}</div>
                                    <div className="text-xs text-orange-700 dark:text-orange-300">Best Streak</div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                        <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{userStats.joinedDays}</div>
                                    <div className="text-xs text-purple-700 dark:text-purple-300">Days Active</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id as any);
                                                clearMessages();
                                            }}
                                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{tab.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            {/* Messages */}
                            {error && (
                                <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                                    <div className="flex items-center">
                                        <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                                        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                                    <div className="flex items-center">
                                        <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                                        <div className="text-sm text-green-700 dark:text-green-300">{success}</div>
                                    </div>
                                </div>
                            )}

                            {/* Profile Info Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Profile Information
                                    </h3>
                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Username
                                            </label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={profileData.username}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter your username"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                                    className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? 'Updating...' : 'Update Profile'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Security Settings
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">Password</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Last changed: {formatDate(user?.created_at || '')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                    <span>Change Password</span>
                                                </button>
                                            </div>

                                            {showPasswordFields && (
                                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Current Password
                                                        </label>
                                                        <div className="relative">
                                                            <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                            <input
                                                                type={showCurrentPassword ? 'text' : 'password'}
                                                                value={passwordData.currentPassword}
                                                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                                className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Enter current password"
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            >
                                                                {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            New Password
                                                        </label>
                                                        <div className="relative">
                                                            <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                            <input
                                                                type={showNewPassword ? 'text' : 'password'}
                                                                value={passwordData.newPassword}
                                                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                                className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Enter new password"
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            >
                                                                {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Confirm New Password
                                                        </label>
                                                        <div className="relative">
                                                            <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                            <input
                                                                type={showConfirmPassword ? 'text' : 'password'}
                                                                value={passwordData.confirmPassword}
                                                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                                className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Confirm new password"
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                            >
                                                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex space-x-3">
                                                        <button
                                                            type="submit"
                                                            disabled={isLoading}
                                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isLoading ? 'Changing...' : 'Change Password'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowPasswordFields(false);
                                                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                            }}
                                                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Notification Preferences
                                    </h3>
                                    
                                    <form onSubmit={handleNotificationUpdate} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Receive habit reminders and updates via email
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationData.email}
                                                        onChange={(e) => setNotificationData(prev => ({ ...prev, email: e.target.checked }))}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Receive browser push notifications for habit reminders
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationData.push}
                                                        onChange={(e) => setNotificationData(prev => ({ ...prev, push: e.target.checked }))}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Default Reminder Time
                                                </label>
                                                <div className="relative">
                                                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <input
                                                        type="time"
                                                        value={notificationData.reminder_time}
                                                        onChange={(e) => setNotificationData(prev => ({ ...prev, reminder_time: e.target.value }))}
                                                        className="pl-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? 'Updating...' : 'Update Preferences'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Danger Zone Tab */}
                            {activeTab === 'danger' && (
                                <div>
                                    <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-6">
                                        Danger Zone
                                    </h3>
                                    
                                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/20">
                                        <div className="flex items-start space-x-4">
                                            <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400 mt-1" />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                                                    Delete Account
                                                </h4>
                                                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                                    Once you delete your account, there is no going back. Please be certain.
                                                    All your habits, progress, and data will be permanently deleted.
                                                </p>
                                                
                                                {!showDeleteConfirm ? (
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(true)}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                                                    >
                                                        Delete Account
                                                    </button>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                                                                Type "DELETE" to confirm account deletion:
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={deleteConfirmText}
                                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                                className="w-full px-4 py-3 border border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                                                placeholder="Type DELETE here"
                                                            />
                                                        </div>
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={handleDeleteAccount}
                                                                disabled={isLoading || deleteConfirmText !== 'DELETE'}
                                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {isLoading ? 'Deleting...' : 'Confirm Deletion'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowDeleteConfirm(false);
                                                                    setDeleteConfirmText('');
                                                                }}
                                                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 