import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import HabitCalendar from '../components/HabitCalendar';
import TimeReminder from '../components/TimeReminder';
import CreateHabitModal from '../components/CreateHabitModal';
import { habitService } from '../services/api';
import { Habit } from '../types/api';
import { Calendar as CalendarIcon, Clock, TrendingUp, Target, Award, Zap, Bell } from 'lucide-react';

const Calendar: React.FC = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [timeOfDay, setTimeOfDay] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'calendar' | 'reminders'>('calendar');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (user) {
            loadHabits();
        }
    }, [user]);

    useEffect(() => {
        // Update time of day greeting
        const updateTimeOfDay = () => {
            const hour = new Date().getHours();
            if (hour < 12) setTimeOfDay('Morning');
            else if (hour < 17) setTimeOfDay('Afternoon');
            else setTimeOfDay('Evening');
        };

        updateTimeOfDay();
        const interval = setInterval(updateTimeOfDay, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const loadHabits = async () => {
        try {
            setLoading(true);
            const response = await habitService.getHabits();
            setHabits(response);
        } catch (error) {
            console.error('Failed to load habits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleHabitComplete = async (habitId: number, date: Date) => {
        try {
            await habitService.completeHabit(habitId);
            // Refresh habits to get updated streak data
            loadHabits();
        } catch (error) {
            console.error('Failed to complete habit:', error);
        }
    };

    const getStreakStats = () => {
        const totalStreaks = habits.reduce((sum, habit) => sum + (habit.current_streak || 0), 0);
        const longestStreak = Math.max(...habits.map(h => h.longest_streak || 0), 0);
        const activeHabits = habits.filter(h => h.is_active).length;
        
        return { totalStreaks, longestStreak, activeHabits };
    };

    const getTodayStats = () => {
        const today = new Date();
        const todayString = today.toDateString();
        
        // Filter habits that should be done today based on frequency
        const todayHabits = habits.filter(habit => {
            if (!habit.is_active) return false;
            
            if (habit.frequency === 'daily') return true;
            if (habit.frequency === 'weekly') {
                // For weekly habits, check if today matches the day they should be done
                // Assuming weekly habits are done on Mondays (day 1)
                return today.getDay() === 1;
            }
            if (habit.frequency === 'monthly') {
                // For monthly habits, check if today is the first day of the month
                return today.getDate() === 1;
            }
            return false;
        });

        // Count actual completions for today
        const completed = todayHabits.filter(habit => {
            if (!habit.last_completed) return false;
            const lastCompletedDate = new Date(habit.last_completed).toDateString();
            return lastCompletedDate === todayString;
        }).length;
        
        return {
            total: todayHabits.length,
            completed,
            remaining: todayHabits.length - completed,
            percentage: todayHabits.length > 0 ? Math.round((completed / todayHabits.length) * 100) : 0
        };
    };

    // Calculate real time-based insights
    const getTimeBasedInsights = () => {
        const completionTimes = habits
            .filter(habit => habit.reminder_time)
            .map(habit => {
                const time = habit.reminder_time;
                const hour = parseInt(time.split(':')[0]);
                return hour;
            });

        if (completionTimes.length === 0) {
            return {
                bestTime: 'morning',
                bestTimeRange: '7-9 AM',
                insight: 'Set reminder times to get personalized insights'
            };
        }

        const averageHour = Math.round(completionTimes.reduce((sum, hour) => sum + hour, 0) / completionTimes.length);
        
        let bestTime = 'morning';
        let bestTimeRange = '7-9 AM';
        
        if (averageHour >= 6 && averageHour < 12) {
            bestTime = 'morning';
            bestTimeRange = '7-9 AM';
        } else if (averageHour >= 12 && averageHour < 17) {
            bestTime = 'afternoon';
            bestTimeRange = '12-2 PM';
        } else if (averageHour >= 17 && averageHour < 21) {
            bestTime = 'evening';
            bestTimeRange = '6-8 PM';
        } else {
            bestTime = 'night';
            bestTimeRange = '9-11 PM';
        }

        return {
            bestTime,
            bestTimeRange,
            insight: `Based on your ${habits.length} habits`
        };
    };

    // Calculate weekly performance
    const getWeeklyPerformance = () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        // Set to Monday as start of week
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        let weeklyCompleted = 0;
        let weeklyTotal = 0;

        habits.forEach(habit => {
            if (!habit.is_active) return;
            
            const daysSinceWeekStart = Math.floor((now.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
            
            if (habit.frequency === 'daily') {
                weeklyTotal += daysSinceWeekStart + 1;
                if (habit.last_completed) {
                    const lastCompleted = new Date(habit.last_completed);
                    if (lastCompleted >= startOfWeek) {
                        weeklyCompleted += Math.min(habit.current_streak, daysSinceWeekStart + 1);
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
        });

        const weeklyPercentage = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;
        return weeklyPercentage;
    };

    const { totalStreaks, longestStreak, activeHabits } = getStreakStats();
    const todayStats = getTodayStats();
    const timeInsights = getTimeBasedInsights();
    const weeklyPerformance = getWeeklyPerformance();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors duration-200">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Habit Calendar</h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Good {timeOfDay}, {user?.username}! Track your progress and build lasting habits.
                    </p>
                </div>

                {/* Real-time Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Today's Progress</p>
                                <p className="text-3xl font-bold">{todayStats.percentage}%</p>
                                <p className="text-blue-100 text-sm">
                                    {todayStats.completed}/{todayStats.total} completed
                                </p>
                            </div>
                            <Target className="h-12 w-12 text-blue-200" />
                        </div>
                        <div className="mt-4 bg-blue-400 bg-opacity-30 rounded-full h-2">
                            <div 
                                className="bg-white h-2 rounded-full transition-all duration-500"
                                style={{ width: `${todayStats.percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Active Habits</p>
                                <p className="text-3xl font-bold">{activeHabits}</p>
                                <p className="text-green-100 text-sm">currently tracking</p>
                            </div>
                            <Zap className="h-12 w-12 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Current Streaks</p>
                                <p className="text-3xl font-bold">{totalStreaks}</p>
                                <p className="text-purple-100 text-sm">total streak days</p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-purple-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Longest Streak</p>
                                <p className="text-3xl font-bold">{longestStreak}</p>
                                <p className="text-orange-100 text-sm">days record</p>
                            </div>
                            <Award className="h-12 w-12 text-orange-200" />
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                                activeTab === 'calendar'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <CalendarIcon className="h-5 w-5" />
                            <span>Calendar View</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('reminders')}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                                activeTab === 'reminders'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <Bell className="h-5 w-5" />
                            <span>Reminders</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'calendar' ? (
                    <HabitCalendar 
                        habits={habits}
                        onDateSelect={handleDateSelect}
                        onHabitComplete={handleHabitComplete}
                    />
                ) : (
                    <TimeReminder 
                        habits={habits}
                        onReminderCreate={(reminder) => {
                            // Reload habits to get updated reminder data
                            loadHabits();
                        }}
                        onReminderUpdate={(reminder) => {
                            // Reload habits to get updated reminder data
                            loadHabits();
                        }}
                        onReminderDelete={(reminderId) => {
                            // Reload habits to get updated reminder data
                            loadHabits();
                        }}
                    />
                )}

                {/* Quick Actions Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => setActiveTab('reminders')}
                            className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-lg transition-all shadow-sm"
                        >
                            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <div className="text-left">
                                <p className="font-medium text-blue-900 dark:text-blue-100">Set Reminder</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Schedule habit reminders</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 rounded-lg transition-all shadow-sm"
                        >
                            <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                            <div className="text-left">
                                <p className="font-medium text-green-900 dark:text-green-100">Add Habit</p>
                                <p className="text-sm text-green-700 dark:text-green-300">Create a new habit</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => navigate('/habits')}
                            className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 rounded-lg transition-all shadow-sm"
                        >
                            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            <div className="text-left">
                                <p className="font-medium text-purple-900 dark:text-purple-100">Manage Habits</p>
                                <p className="text-sm text-purple-700 dark:text-purple-300">View and edit all habits</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Time-based Insights */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-white">
                    <h3 className="text-xl font-semibold mb-4">Real-time Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-medium mb-2">Best Performance Time</h4>
                            <p className="text-indigo-100 dark:text-indigo-200">
                                You prefer <span className="font-bold">{timeInsights.bestTime}</span> habits
                                <br />
                                <span className="text-sm">({timeInsights.insight})</span>
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">This Week's Performance</h4>
                            <p className="text-indigo-100 dark:text-indigo-200">
                                <span className="font-bold text-2xl">{weeklyPerformance}%</span> completion rate
                                <br />
                                <span className="text-sm">
                                    {weeklyPerformance >= 80 ? 'Excellent work!' : 
                                     weeklyPerformance >= 60 ? 'Good progress!' : 
                                     'Keep pushing forward!'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Optimal Schedule</h4>
                            <p className="text-indigo-100 dark:text-indigo-200">
                                Schedule new habits around <span className="font-bold">{timeInsights.bestTimeRange}</span>
                                <br />
                                <span className="text-sm">for better consistency</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Habit Modal */}
            <CreateHabitModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onHabitCreated={loadHabits}
            />
        </div>
    );
};

export default Calendar; 