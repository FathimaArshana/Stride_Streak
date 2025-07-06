import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { habitService } from '../services/api';
import type { Habit, HabitStats } from '../types/api';
import { 
    CheckCircleIcon, 
    FireIcon, 
    TrophyIcon, 
    CalendarIcon,
    PlusIcon,
    ChartBarIcon,
    BellIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import CreateHabitModal from '../components/CreateHabitModal';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [stats, setStats] = useState<HabitStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completingHabit, setCompletingHabit] = useState<number | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [habitsData, statsData] = await Promise.all([
                habitService.getHabits(),
                habitService.getStats(),
            ]);
            setHabits(habitsData);
            setStats(statsData);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Dashboard data fetch failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteHabit = async (habitId: number) => {
        setCompletingHabit(habitId);
        try {
            await habitService.completeHabit(habitId);
            await fetchDashboardData(); // Refresh data
        } catch (err) {
            console.error('Failed to complete habit:', err);
        } finally {
            setCompletingHabit(null);
        }
    };

    const isHabitCompletedToday = (habit: Habit) => {
        if (!habit.last_completed) return false;
        const today = new Date().toDateString();
        const lastCompleted = new Date(habit.last_completed).toDateString();
        return today === lastCompleted;
    };

    const getStreakColor = (streak: number) => {
        if (streak >= 30) return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
        if (streak >= 14) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
        if (streak >= 7) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
        if (streak >= 3) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    };

    const handleViewAnalytics = () => {
        navigate('/calendar');
    };

    const handleSetReminders = () => {
        navigate('/profile?tab=notifications');
    };

    // Calculate real quick stats
    const calculateQuickStats = () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let weeklyCompleted = 0;
        let weeklyTotal = 0;
        let monthlyCompleted = 0;
        let monthlyTotal = 0;
        
        habits.forEach(habit => {
            if (!habit.is_active) return;
            
            // Calculate weekly stats
            const weekDays = Math.ceil((now.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
            if (habit.frequency === 'daily') {
                weeklyTotal += weekDays;
                // Estimate completions based on current streak and last completed
                if (habit.last_completed) {
                    const lastCompleted = new Date(habit.last_completed);
                    if (lastCompleted >= startOfWeek) {
                        weeklyCompleted += Math.min(habit.current_streak, weekDays);
                    }
                }
            } else if (habit.frequency === 'weekly') {
                weeklyTotal += 1;
                if (habit.last_completed) {
                    const lastCompleted = new Date(habit.last_completed);
                    if (lastCompleted >= startOfWeek) {
                        weeklyCompleted += 1;
                    }
                }
            }
            
            // Calculate monthly stats
            const monthDays = now.getDate();
            if (habit.frequency === 'daily') {
                monthlyTotal += monthDays;
                if (habit.last_completed) {
                    const lastCompleted = new Date(habit.last_completed);
                    if (lastCompleted >= startOfMonth) {
                        monthlyCompleted += Math.min(habit.current_streak, monthDays);
                    }
                }
            } else if (habit.frequency === 'weekly') {
                const weeksInMonth = Math.ceil(monthDays / 7);
                monthlyTotal += weeksInMonth;
                if (habit.last_completed) {
                    const lastCompleted = new Date(habit.last_completed);
                    if (lastCompleted >= startOfMonth) {
                        monthlyCompleted += Math.min(Math.ceil(habit.current_streak / 7), weeksInMonth);
                    }
                }
            } else if (habit.frequency === 'monthly') {
                monthlyTotal += 1;
                if (habit.last_completed) {
                    const lastCompleted = new Date(habit.last_completed);
                    if (lastCompleted >= startOfMonth) {
                        monthlyCompleted += 1;
                    }
                }
            }
        });
        
        const weeklyPercentage = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;
        const monthlyPercentage = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0;
        
        return {
            weeklyPercentage,
            monthlyPercentage,
            longestStreak: stats?.longest_streak || 0
        };
    };

    // Generate real achievements based on user data
    const generateRecentAchievements = () => {
        const achievements = [];
        
        // Check for streak milestones
        habits.forEach(habit => {
            if (habit.current_streak >= 30) {
                achievements.push({
                    icon: TrophyIcon,
                    iconColor: 'text-purple-600 dark:text-purple-400',
                    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
                    title: '30-Day Streak!',
                    description: habit.title,
                    priority: 4
                });
            } else if (habit.current_streak >= 14) {
                achievements.push({
                    icon: FireIcon,
                    iconColor: 'text-orange-600 dark:text-orange-400',
                    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
                    title: '2-Week Streak!',
                    description: habit.title,
                    priority: 3
                });
            } else if (habit.current_streak >= 7) {
                achievements.push({
                    icon: StarIcon,
                    iconColor: 'text-yellow-600 dark:text-yellow-400',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                    title: '7-Day Streak!',
                    description: habit.title,
                    priority: 2
                });
            } else if (habit.current_streak >= 3) {
                achievements.push({
                    icon: CheckCircleIcon,
                    iconColor: 'text-green-600 dark:text-green-400',
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    title: '3-Day Streak!',
                    description: habit.title,
                    priority: 1
                });
            }
        });
        
        // Level-based achievements
        if (user?.level && user.level >= 5) {
            achievements.push({
                icon: TrophyIcon,
                iconColor: 'text-purple-600 dark:text-purple-400',
                bgColor: 'bg-purple-100 dark:bg-purple-900/30',
                title: 'Level Master!',
                description: `Reached level ${user.level}`,
                priority: 4
            });
        } else if (user?.level && user.level >= 3) {
            achievements.push({
                icon: StarIcon,
                iconColor: 'text-blue-600 dark:text-blue-400',
                bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                title: 'Level Up!',
                description: `Reached level ${user.level}`,
                priority: 2
            });
        }
        
        // Points milestones
        if (user?.points && user.points >= 1000) {
            achievements.push({
                icon: TrophyIcon,
                iconColor: 'text-gold-600 dark:text-yellow-400',
                bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                title: 'Point Master!',
                description: `${user.points} points earned`,
                priority: 3
            });
        } else if (user?.points && user.points >= 500) {
            achievements.push({
                icon: StarIcon,
                iconColor: 'text-green-600 dark:text-green-400',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
                title: 'Point Collector!',
                description: `${user.points} points earned`,
                priority: 2
            });
        }
        
        // Sort by priority and return top 3
        return achievements
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 3);
    };

    const quickStats = calculateQuickStats();
    const recentAchievements = generateRecentAchievements();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-red-600 dark:text-red-400 text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xl font-semibold">{error}</p>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Please try refreshing the page</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    const todaysHabits = habits.filter(habit => habit.is_active);
    const completedToday = todaysHabits.filter(isHabitCompletedToday).length;
    const completionRate = todaysHabits.length > 0 ? (completedToday / todaysHabits.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.username}! 👋
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Let's make today count. You're on level {user?.level} with {user?.points} points!
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                                <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Progress</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {completedToday}/{todaysHabits.length}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${completionRate}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{Math.round(completionRate)}% complete</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                                <FireIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streaks</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.total_streaks || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                                <TrophyIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Longest Streak</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.longest_streak || 0} days
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                                <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Habits</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.total_habits || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Today's Habits */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Today's Habits</h2>
                                    <button 
                                        onClick={() => setShowCreateModal(true)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Habit
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {todaysHabits.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No habits for today</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Get started by creating your first habit.
                                        </p>
                                        <div className="mt-6">
                                            <button 
                                                onClick={() => setShowCreateModal(true)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                <PlusIcon className="h-4 w-4 mr-2" />
                                                Create Your First Habit
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {todaysHabits.map((habit) => {
                                            const isCompleted = isHabitCompletedToday(habit);
                                            const isCompleting = completingHabit === habit.id;
                                            
                                            return (
                                                <div
                                                    key={habit.id}
                                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                                        isCompleted 
                                                            ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200 dark:hover:border-blue-600'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <button
                                                                onClick={() => !isCompleted && handleCompleteHabit(habit.id)}
                                                                disabled={isCompleted || isCompleting}
                                                                className={`p-2 rounded-full transition-colors ${
                                                                    isCompleted
                                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default'
                                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                                                                }`}
                                                            >
                                                                {isCompleting ? (
                                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                                                                ) : isCompleted ? (
                                                                    <CheckCircleIconSolid className="h-5 w-5" />
                                                                ) : (
                                                                    <CheckCircleIcon className="h-5 w-5" />
                                                                )}
                                                            </button>
                                                            
                                                            <div>
                                                                <h3 className={`font-medium ${
                                                                    isCompleted 
                                                                        ? 'text-green-900 dark:text-green-400 line-through' 
                                                                        : 'text-gray-900 dark:text-white'
                                                                }`}>
                                                                    {habit.title}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>
                                                                <div className="flex items-center mt-1 space-x-2">
                                                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                        {habit.frequency} • {habit.reminder_time}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-3">
                                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStreakColor(habit.current_streak)}`}>
                                                                🔥 {habit.current_streak} day streak
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                                    <span className={`font-semibold ${
                                        quickStats.weeklyPercentage >= 80 ? 'text-green-600 dark:text-green-400' :
                                        quickStats.weeklyPercentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-gray-900 dark:text-white'
                                    }`}>
                                        {quickStats.weeklyPercentage}% Complete
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                                    <span className={`font-semibold ${
                                        quickStats.monthlyPercentage >= 80 ? 'text-green-600 dark:text-green-400' :
                                        quickStats.monthlyPercentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-gray-900 dark:text-white'
                                    }`}>
                                        {quickStats.monthlyPercentage}% Complete
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Best Streak</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {quickStats.longestStreak} days
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Achievements */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Achievements</h3>
                            <div className="space-y-3">
                                {recentAchievements.length > 0 ? (
                                    recentAchievements.map((achievement, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className={`p-2 ${achievement.bgColor} rounded-full`}>
                                                <achievement.icon className={`h-4 w-4 ${achievement.iconColor}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {achievement.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {achievement.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <TrophyIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Complete habits to unlock achievements!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => setShowCreateModal(true)}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add New Habit
                                </button>
                                <button 
                                    onClick={handleViewAnalytics}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                                >
                                    <ChartBarIcon className="h-4 w-4 mr-2" />
                                    View Analytics
                                </button>
                                <button 
                                    onClick={handleSetReminders}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                                >
                                    <BellIcon className="h-4 w-4 mr-2" />
                                    Set Reminders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Habit Modal */}
            <CreateHabitModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onHabitCreated={fetchDashboardData}
            />
        </div>
    );
};

export default Dashboard; 