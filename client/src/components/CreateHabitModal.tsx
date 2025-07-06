import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { habitService } from '../services/api';
import type { CreateHabitRequest, HabitFrequency } from '../types/api';

interface CreateHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHabitCreated: () => void;
}

const CreateHabitModal: React.FC<CreateHabitModalProps> = ({ isOpen, onClose, onHabitCreated }) => {
    const [formData, setFormData] = useState<CreateHabitRequest>({
        title: '',
        description: '',
        frequency: 'daily',
        reminder_time: '09:00',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await habitService.createHabit(formData);
            setFormData({
                title: '',
                description: '',
                frequency: 'daily',
                reminder_time: '09:00',
            });
            onHabitCreated();
            onClose();
        } catch (err) {
            setError('Failed to create habit. Please try again.');
            console.error('Habit creation failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof CreateHabitRequest, value: string | HabitFrequency) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Habit</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Habit Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="e.g., Read for 30 minutes"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Optional description of your habit..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Frequency *
                        </label>
                        <select
                            id="frequency"
                            required
                            value={formData.frequency}
                            onChange={(e) => handleChange('frequency', e.target.value as HabitFrequency)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="reminder_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reminder Time
                        </label>
                        <input
                            type="time"
                            id="reminder_time"
                            value={formData.reminder_time}
                            onChange={(e) => handleChange('reminder_time', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </div>
                            ) : (
                                'Create Habit'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateHabitModal; 