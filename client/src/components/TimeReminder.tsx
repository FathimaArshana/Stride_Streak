import React, { useState, useEffect } from 'react';
import { Clock, Bell, Calendar, Plus, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { habitService } from '../services/api';

interface Reminder {
    id: number;
    habitId: number;
    habitTitle: string;
    time: string;
    days: string[];
    enabled: boolean;
    notificationType: 'browser' | 'email' | 'both';
}

interface TimeReminderProps {
    habits: any[];
    onReminderCreate?: (reminder: Omit<Reminder, 'id'>) => void;
    onReminderUpdate?: (reminder: Reminder) => void;
    onReminderDelete?: (reminderId: number) => void;
}

const TimeReminder: React.FC<TimeReminderProps> = ({
    habits = [],
    onReminderCreate,
    onReminderUpdate,
    onReminderDelete
}) => {
    const { theme } = useTheme();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; reminder: Reminder | null }>({
        isOpen: false,
        reminder: null
    });

    // Form state
    const [formData, setFormData] = useState({
        habitId: '',
        time: '',
        days: [] as string[],
        notificationType: 'browser' as 'browser' | 'email' | 'both'
    });

    const daysOfWeek = [
        { key: 'monday', label: 'Mon' },
        { key: 'tuesday', label: 'Tue' },
        { key: 'wednesday', label: 'Wed' },
        { key: 'thursday', label: 'Thu' },
        { key: 'friday', label: 'Fri' },
        { key: 'saturday', label: 'Sat' },
        { key: 'sunday', label: 'Sun' }
    ];

    // Update current time and check for upcoming reminders
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            checkUpcomingReminders(now);
        }, 1000);

        return () => clearInterval(timer);
    }, [reminders]);

    // Generate reminders from actual habit data
    useEffect(() => {
        if (habits.length > 0) {
            const habitReminders: Reminder[] = habits
                .filter(habit => habit.reminder_time && habit.is_active)
                .map(habit => {
                    // Generate days based on frequency
                    let days: string[] = [];
                    if (habit.frequency === 'daily') {
                        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    } else if (habit.frequency === 'weekly') {
                        days = ['monday']; // Weekly habits default to Monday
                    } else if (habit.frequency === 'monthly') {
                        days = ['monday']; // Monthly habits default to first Monday
                    }

                    return {
                        id: habit.id,
                        habitId: habit.id,
                        habitTitle: habit.title,
                        time: habit.reminder_time,
                        days: days,
                        enabled: true,
                        notificationType: 'browser' as 'browser' | 'email' | 'both'
                    };
                });
            
            setReminders(habitReminders);
        } else {
            setReminders([]);
        }
    }, [habits]);

    const checkUpcomingReminders = (now: Date) => {
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const currentTime = now.toTimeString().slice(0, 5);
        
        const upcoming = reminders.filter(reminder => {
            if (!reminder.enabled) return false;
            
            const reminderTime = reminder.time;
            const timeDiff = getTimeDifference(currentTime, reminderTime);
            
            return reminder.days.includes(currentDay) && timeDiff <= 15 && timeDiff >= 0;
        });

        setUpcomingReminders(upcoming);
    };

    const getTimeDifference = (current: string, target: string): number => {
        const [currentHour, currentMinute] = current.split(':').map(Number);
        const [targetHour, targetMinute] = target.split(':').map(Number);
        
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const targetTotalMinutes = targetHour * 60 + targetMinute;
        
        return targetTotalMinutes - currentTotalMinutes;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.habitId || !formData.time || formData.days.length === 0) {
            alert('Please fill in all required fields');
            return;
        }

        const selectedHabit = habits.find(h => h.id.toString() === formData.habitId);
        if (!selectedHabit) {
            alert('Selected habit not found');
            return;
        }

        setLoading(true);
        try {
            // Update the habit's reminder_time
            await habitService.updateHabit(parseInt(formData.habitId), {
                reminder_time: formData.time
            });

            const reminderData = {
                habitId: parseInt(formData.habitId),
                habitTitle: selectedHabit.title,
                time: formData.time,
                days: formData.days,
                enabled: true,
                notificationType: formData.notificationType
            };

            if (editingReminder) {
                const updatedReminder: Reminder = {
                    ...reminderData,
                    id: editingReminder.id
                };
                
                setReminders(prev => prev.map(r => r.id === editingReminder.id ? updatedReminder : r));
                onReminderUpdate?.(updatedReminder);
                setEditingReminder(null);
            } else {
                const newReminder: Reminder = {
                    ...reminderData,
                    id: parseInt(formData.habitId)
                };
                
                setReminders(prev => {
                    const filtered = prev.filter(r => r.habitId !== parseInt(formData.habitId));
                    return [...filtered, newReminder];
                });
                onReminderCreate?.(reminderData);
            }

            resetForm();
        } catch (error) {
            console.error('Failed to save reminder:', error);
            alert('Failed to save reminder. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            habitId: '',
            time: '',
            days: [],
            notificationType: 'browser'
        });
        setShowCreateForm(false);
        setEditingReminder(null);
    };

    const handleEdit = (reminder: Reminder) => {
        setFormData({
            habitId: reminder.habitId.toString(),
            time: reminder.time,
            days: reminder.days,
            notificationType: reminder.notificationType
        });
        setEditingReminder(reminder);
        setShowCreateForm(true);
    };

    const openDeleteConfirmation = (reminder: Reminder) => {
        setDeleteConfirmation({ isOpen: true, reminder });
    };

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation({ isOpen: false, reminder: null });
    };

    const handleDeleteConfirmed = async () => {
        if (!deleteConfirmation.reminder) return;

        const reminder = deleteConfirmation.reminder;
        setLoading(true);
        try {
            console.log('Deleting reminder for habit ID:', reminder.habitId);
            
            // Remove reminder_time from the habit
            await habitService.updateHabit(reminder.habitId, {
                reminder_time: null
            });

            console.log('Reminder deleted successfully');
            setReminders(prev => prev.filter(r => r.id !== reminder.id));
            onReminderDelete?.(reminder.id);
            closeDeleteConfirmation();
        } catch (error: any) {
            console.error('Failed to delete reminder:', error);
            console.error('Error details:', error.response?.data || error.message);
            
            const errorMessage = error.response?.data?.error || error.message || 'Failed to delete reminder. Please try again.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleReminder = async (reminderId: number) => {
        const reminder = reminders.find(r => r.id === reminderId);
        if (!reminder) return;

        setLoading(true);
        try {
            const newEnabledState = !reminder.enabled;
            
            // If disabling, remove reminder_time; if enabling, we need the time to be set
            if (!newEnabledState) {
                await habitService.updateHabit(reminder.habitId, {
                    reminder_time: null
                });
            } else {
                await habitService.updateHabit(reminder.habitId, {
                    reminder_time: reminder.time
                });
            }

            setReminders(prev => prev.map(r => 
                r.id === reminderId ? { ...r, enabled: newEnabledState } : r
            ));
        } catch (error) {
            console.error('Failed to toggle reminder:', error);
            alert('Failed to update reminder. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDayToggle = (day: string) => {
        setFormData(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day]
        }));
    };

    const formatTime = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Reminders</h2>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono">
                            {currentTime.toLocaleTimeString('en-US', {
                                hour12: true,
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Reminder</span>
                    </button>
                </div>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-300 text-sm">Processing...</p>
                </div>
            )}

            {/* Upcoming Reminders Alert */}
            {upcomingReminders.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                        <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Upcoming Reminders</h3>
                    </div>
                    <div className="space-y-1">
                        {upcomingReminders.map(reminder => (
                            <p key={reminder.id} className="text-sm text-yellow-700 dark:text-yellow-300">
                                <span className="font-medium">{reminder.habitTitle}</span> at {formatTime(reminder.time)}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Create/Edit Form */}
            {showCreateForm && (
                <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
                    </h3>
                    
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Habit
                                </label>
                                <select
                                    value={formData.habitId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, habitId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Choose a habit...</option>
                                    {habits.map(habit => (
                                        <option key={habit.id} value={habit.id}>
                                            {habit.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reminder Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Days of Week
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {daysOfWeek.map(day => (
                                    <button
                                        key={day.key}
                                        type="button"
                                        onClick={() => handleDayToggle(day.key)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            formData.days.includes(day.key)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Notification Type
                            </label>
                            <select
                                value={formData.notificationType}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    notificationType: e.target.value as 'browser' | 'email' | 'both'
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="browser">Browser Notification</option>
                                <option value="email">Email Notification</option>
                                <option value="both">Both</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                            >
                                {loading ? 'Saving...' : (editingReminder ? 'Update Reminder' : 'Create Reminder')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={loading}
                                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reminders List */}
            <div className="space-y-4">
                {reminders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-500" />
                        <p className="text-lg font-medium">No reminders set</p>
                        <p className="text-sm">Create your first reminder to stay on track with your habits</p>
                    </div>
                ) : (
                    reminders.map(reminder => (
                        <div
                            key={reminder.id}
                            className={`p-4 rounded-lg border transition-all ${
                                reminder.enabled
                                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'
                                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700 opacity-60'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => toggleReminder(reminder.id)}
                                            disabled={loading}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors disabled:opacity-50 ${
                                                reminder.enabled
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-gray-300 dark:border-gray-500'
                                            }`}
                                        >
                                            {reminder.enabled && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{reminder.habitTitle}</h4>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center space-x-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{formatTime(reminder.time)}</span>
                                                </span>
                                                <span>{reminder.days.length} days/week</span>
                                                <span className="capitalize">{reminder.notificationType}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleEdit(reminder)}
                                        disabled={loading}
                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => openDeleteConfirmation(reminder)}
                                        disabled={loading}
                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Days display */}
                            <div className="mt-3 flex flex-wrap gap-1">
                                {daysOfWeek.map(day => (
                                    <span
                                        key={day.key}
                                        className={`px-2 py-1 text-xs rounded ${
                                            reminder.days.includes(day.key)
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                                        }`}
                                    >
                                        {day.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && deleteConfirmation.reminder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Delete Reminder
                                </h3>
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Are you sure you want to delete the reminder for "{deleteConfirmation.reminder.habitTitle}"?
                            </p>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <div className="flex">
                                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-red-700 dark:text-red-300">
                                        <p className="font-medium mb-1">This action cannot be undone.</p>
                                        <p>The reminder scheduled for {formatTime(deleteConfirmation.reminder.time)} will be permanently removed from this habit.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={closeDeleteConfirmation}
                                disabled={loading}
                                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirmed}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Deleting...' : 'Delete Reminder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeReminder; 