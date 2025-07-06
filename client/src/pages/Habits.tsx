import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { habitService } from '../services/api';
import type { Habit, CreateHabitRequest, UpdateHabitRequest, HabitFrequency } from '../types/api';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    CheckCircleIcon,
    XCircleIcon,
    FireIcon,
    TrophyIcon,
    CalendarIcon,
    ClockIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    StarIcon,
    PlayIcon,
    PauseIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface HabitStats {
    total: number;
    active: number;
    completed_today: number;
    total_streaks: number;
    longest_streak: number;
    completion_rate: number;
}

const Habits: React.FC = () => {
    const { theme } = useTheme();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
    const [habitStats, setHabitStats] = useState<HabitStats | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; habit: Habit | null }>({
        isOpen: false,
        habit: null
    });
    
    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [filterFrequency, setFilterFrequency] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'streak' | 'created' | 'frequency'>('name');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const [formData, setFormData] = useState<CreateHabitRequest>({
        title: '',
        description: '',
        frequency: 'daily',
        reminder_time: '09:00',
    });

    useEffect(() => {
        fetchHabits();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [habits, searchTerm, filterStatus, filterFrequency, sortBy]);

    const fetchHabits = async () => {
        try {
            const data = await habitService.getHabits();
            setHabits(data);
            calculateStats(data);
        } catch (err) {
            setError('Failed to load habits');
            console.error('Habits fetch failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (habitsData: Habit[]) => {
        const today = new Date().toDateString();
        const completedToday = habitsData.filter(h => {
            if (!h.last_completed) return false;
            return new Date(h.last_completed).toDateString() === today;
        }).length;

        const totalStreaks = habitsData.reduce((sum, h) => sum + h.current_streak, 0);
        const longestStreak = Math.max(...habitsData.map(h => h.longest_streak), 0);
        const activeHabits = habitsData.filter(h => h.is_active).length;
        const completionRate = habitsData.length > 0 ? (completedToday / habitsData.length) * 100 : 0;

        setHabitStats({
            total: habitsData.length,
            active: activeHabits,
            completed_today: completedToday,
            total_streaks: totalStreaks,
            longest_streak: longestStreak,
            completion_rate: Math.round(completionRate)
        });
    };

    const applyFilters = () => {
        let filtered = [...habits];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(habit =>
                habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                habit.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(habit => 
                filterStatus === 'active' ? habit.is_active : !habit.is_active
            );
        }

        // Frequency filter
        if (filterFrequency !== 'all') {
            filtered = filtered.filter(habit => habit.frequency === filterFrequency);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'streak':
                    return b.current_streak - a.current_streak;
                case 'created':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'frequency':
                    return a.frequency.localeCompare(b.frequency);
                default:
                    return 0;
            }
        });

        setFilteredHabits(filtered);
    };

    const handleCreateHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            await habitService.createHabit(formData);
            setIsCreateModalOpen(false);
            setFormData({
                title: '',
                description: '',
                frequency: 'daily',
                reminder_time: '09:00',
            });
            setSuccess('Habit created successfully!');
            fetchHabits();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create habit');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingHabit) return;
        setIsLoading(true);
        setError(null);

        const updateData: UpdateHabitRequest = {
            title: formData.title,
            description: formData.description,
            frequency: formData.frequency,
            reminder_time: formData.reminder_time,
        };

        try {
            await habitService.updateHabit(editingHabit.id, updateData);
            setEditingHabit(null);
            setFormData({
                title: '',
                description: '',
                frequency: 'daily',
                reminder_time: '09:00',
            });
            setSuccess('Habit updated successfully!');
            fetchHabits();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update habit');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteHabit = async (habitId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            await habitService.deleteHabit(habitId);
            setSuccess('Habit deleted successfully!');
            setDeleteConfirmation({ isOpen: false, habit: null });
            setSelectedHabit(null);
            fetchHabits();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete habit');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteHabit = async (habitId: number) => {
        setError(null);
        try {
            await habitService.completeHabit(habitId);
            setSuccess('Habit completed! Keep up the great work!');
            fetchHabits();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to complete habit');
        }
    };

    const handleToggleHabitStatus = async (habit: Habit) => {
        setError(null);
        try {
            await habitService.updateHabit(habit.id, { is_active: !habit.is_active });
            setSuccess(`Habit ${habit.is_active ? 'paused' : 'activated'} successfully!`);
            fetchHabits();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update habit status');
        }
    };

    const openEditModal = (habit: Habit) => {
        setEditingHabit(habit);
        setFormData({
            title: habit.title,
            description: habit.description,
            frequency: habit.frequency,
            reminder_time: habit.reminder_time,
        });
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setEditingHabit(null);
        setSelectedHabit(null);
        setFormData({
            title: '',
            description: '',
            frequency: 'daily',
            reminder_time: '09:00',
        });
        setError(null);
    };

    const getStreakColor = (streak: number) => {
        if (streak >= 30) return 'text-purple-600 dark:text-purple-400';
        if (streak >= 14) return 'text-blue-600 dark:text-blue-400';
        if (streak >= 7) return 'text-green-600 dark:text-green-400';
        if (streak >= 3) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const getStreakBgColor = (streak: number) => {
        if (streak >= 30) return 'bg-purple-100 dark:bg-purple-900/30';
        if (streak >= 14) return 'bg-blue-100 dark:bg-blue-900/30';
        if (streak >= 7) return 'bg-green-100 dark:bg-green-900/30';
        if (streak >= 3) return 'bg-yellow-100 dark:bg-yellow-900/30';
        return 'bg-gray-100 dark:bg-gray-800';
    };

    const isCompletedToday = (habit: Habit) => {
        if (!habit.last_completed) return false;
        const today = new Date().toDateString();
        return new Date(habit.last_completed).toDateString() === today;
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const openDeleteConfirmation = (habit: Habit) => {
        setDeleteConfirmation({ isOpen: true, habit });
    };

    const closeDeleteConfirmation = () => {
        setDeleteConfirmation({ isOpen: false, habit: null });
    };

    if (isLoading && habits.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading your habits...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Habits</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                        Build better habits, one day at a time
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                        <div className="flex items-center">
                            <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
                            <button
                                onClick={clearMessages}
                                className="ml-auto text-red-400 hover:text-red-600"
                            >
                                <XCircleIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                            <div className="text-sm text-green-700 dark:text-green-300">{success}</div>
                            <button
                                onClick={clearMessages}
                                className="ml-auto text-green-400 hover:text-green-600"
                            >
                                <XCircleIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Overview */}
                {habitStats && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
                                {habitStats.total}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                Total Habits
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <PlayIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 text-center">
                                {habitStats.active}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                Active
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 text-center">
                                {habitStats.completed_today}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                Completed Today
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <FireIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 text-center">
                                {habitStats.total_streaks}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                Total Streaks
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <TrophyIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 text-center">
                                {habitStats.longest_streak}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                Best Streak
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <StarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 text-center">
                                {habitStats.completion_rate}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                Today's Rate
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search habits..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <select
                                value={filterFrequency}
                                onChange={(e) => setFilterFrequency(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Frequencies</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="streak">Sort by Streak</option>
                                <option value="created">Sort by Created</option>
                                <option value="frequency">Sort by Frequency</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {viewMode === 'grid' ? 'List View' : 'Grid View'}
                            </button>
                            
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span>Create Habit</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Habits Grid/List */}
                {filteredHabits.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
                            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <CalendarIcon className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                {searchTerm || filterStatus !== 'all' || filterFrequency !== 'all' 
                                    ? 'No habits match your filters' 
                                    : 'No habits yet'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {searchTerm || filterStatus !== 'all' || filterFrequency !== 'all'
                                    ? 'Try adjusting your search or filters to find habits.'
                                    : 'Create your first habit to start building better routines.'}
                            </p>
                            {!searchTerm && filterStatus === 'all' && filterFrequency === 'all' && (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    <span>Create Your First Habit</span>
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                        : "space-y-4"
                    }>
                        {filteredHabits.map((habit) => (
                            <div
                                key={habit.id}
                                className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 ${
                                    !habit.is_active ? 'opacity-60' : ''
                                } ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}
                            >
                                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {habit.title}
                                                </h3>
                                                {!habit.is_active && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                                        Paused
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {habit.description}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center space-x-1 ml-2">
                                            <button
                                                onClick={() => handleToggleHabitStatus(habit)}
                                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                title={habit.is_active ? 'Pause habit' : 'Activate habit'}
                                            >
                                                {habit.is_active ? (
                                                    <PauseIcon className="h-4 w-4" />
                                                ) : (
                                                    <PlayIcon className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setSelectedHabit(habit)}
                                                className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                title="View details"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(habit)}
                                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                title="Edit habit"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteConfirmation(habit)}
                                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                title="Delete habit"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4 text-sm">
                                            <div className="flex items-center space-x-1">
                                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600 dark:text-gray-400 capitalize">
                                                    {habit.frequency}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {habit.reminder_time}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStreakBgColor(habit.current_streak)}`}>
                                            <FireIcon className={`h-4 w-4 ${getStreakColor(habit.current_streak)}`} />
                                            <span className={getStreakColor(habit.current_streak)}>
                                                {habit.current_streak} day{habit.current_streak !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {habit.is_active && (
                                        <button
                                            onClick={() => handleCompleteHabit(habit.id)}
                                            disabled={isCompletedToday(habit)}
                                            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors ${
                                                isCompletedToday(habit)
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                        >
                                            {isCompletedToday(habit) ? (
                                                <>
                                                    <CheckCircleIconSolid className="h-5 w-5" />
                                                    <span>Completed Today</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                    <span>Mark Complete</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create/Edit Modal */}
                {(isCreateModalOpen || editingHabit) && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <form
                                onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Habit Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Drink 8 glasses of water"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Why is this habit important to you?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Frequency *
                                    </label>
                                    <select
                                        required
                                        value={formData.frequency}
                                        onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as HabitFrequency }))}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reminder Time *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.reminder_time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reminder_time: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Saving...' : (editingHabit ? 'Update Habit' : 'Create Habit')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Habit Details Modal */}
                {selectedHabit && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Habit Details
                                </h2>
                                <button
                                    onClick={() => setSelectedHabit(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {selectedHabit.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {selectedHabit.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
                                        <div className={`text-2xl font-bold ${getStreakColor(selectedHabit.current_streak)}`}>
                                            {selectedHabit.current_streak} days
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Best Streak</div>
                                        <div className={`text-2xl font-bold ${getStreakColor(selectedHabit.longest_streak)}`}>
                                            {selectedHabit.longest_streak} days
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Frequency</div>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                                            {selectedHabit.frequency}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Reminder</div>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                                            {selectedHabit.reminder_time}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                                    <div className={`text-lg font-medium ${
                                        selectedHabit.is_active 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {selectedHabit.is_active ? 'Active' : 'Paused'}
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Created</div>
                                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                                        {new Date(selectedHabit.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                {selectedHabit.last_completed && (
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Last Completed</div>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                                            {new Date(selectedHabit.last_completed).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setSelectedHabit(null);
                                            openEditModal(selectedHabit);
                                        }}
                                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        <span>Edit</span>
                                    </button>
                                    {selectedHabit.is_active && !isCompletedToday(selectedHabit) && (
                                        <button
                                            onClick={() => {
                                                handleCompleteHabit(selectedHabit.id);
                                                setSelectedHabit(null);
                                            }}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                        >
                                            <CheckCircleIcon className="h-4 w-4" />
                                            <span>Complete</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedHabit(null);
                                            openDeleteConfirmation(selectedHabit);
                                        }}
                                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirmation.isOpen && deleteConfirmation.habit && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Delete Habit
                                    </h3>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Are you sure you want to delete the habit "{deleteConfirmation.habit.title}"?
                                </p>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-700 dark:text-red-300">
                                            <p className="font-medium mb-1">This action cannot be undone.</p>
                                            <p>All progress data including your {deleteConfirmation.habit.current_streak}-day streak will be permanently deleted.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={closeDeleteConfirmation}
                                    className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteHabit(deleteConfirmation.habit!.id)}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete Habit'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Habits; 