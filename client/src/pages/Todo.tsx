import React, { useState, useEffect } from 'react';
import { PlusIcon, CheckIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { todoService } from '../services/api';
import type { Todo as TodoItem, TodoStats } from '../types/api';

const Todo: React.FC = () => {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [stats, setStats] = useState<TodoStats>({ total: 0, completed: 0, pending: 0 });
    const [newTodo, setNewTodo] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load todos and stats on component mount
    useEffect(() => {
        loadTodos();
        loadStats();
    }, []);

    const loadTodos = async () => {
        try {
            setIsLoading(true);
            const todosData = await todoService.getTodos();
            setTodos(todosData);
            setError(null);
        } catch (err) {
            console.error('Error loading todos:', err);
            setError('Failed to load todos');
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const statsData = await todoService.getStats();
            setStats(statsData);
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    const addTodo = async () => {
        if (!newTodo.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const todo = await todoService.createTodo({ text: newTodo.trim() });
            setTodos([todo, ...todos]);
            setNewTodo('');
            loadStats(); // Refresh stats
            setError(null);
        } catch (err) {
            console.error('Error creating todo:', err);
            setError('Failed to create todo');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleTodo = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            const updatedTodo = await todoService.updateTodo(id, { completed: !todo.completed });
            setTodos(todos.map(t => t.id === id ? updatedTodo : t));
            loadStats(); // Refresh stats
        } catch (err) {
            console.error('Error updating todo:', err);
            setError('Failed to update todo');
        }
    };

    const deleteTodo = async (id: number) => {
        try {
            await todoService.deleteTodo(id);
            setTodos(todos.filter(t => t.id !== id));
            loadStats(); // Refresh stats
        } catch (err) {
            console.error('Error deleting todo:', err);
            setError('Failed to delete todo');
        }
    };

    const startEditing = (id: number, text: string) => {
        setEditingId(id);
        setEditingText(text);
    };

    const saveEdit = async () => {
        if (!editingText.trim() || !editingId) return;

        try {
            const updatedTodo = await todoService.updateTodo(editingId, { text: editingText.trim() });
            setTodos(todos.map(t => t.id === editingId ? updatedTodo : t));
            setEditingId(null);
            setEditingText('');
            setError(null);
        } catch (err) {
            console.error('Error updating todo:', err);
            setError('Failed to update todo');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingText('');
    };

    const completedCount = stats.completed;
    const totalCount = stats.total;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-950 pt-20 px-4 sm:px-6 lg:px-8 transition-all duration-500">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Todo List
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                        Stay organized and track your daily tasks
                    </p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                        </div>
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Done</div>
                        </div>
                        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6">
                        <div className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</div>
                    </div>
                )}

                {/* Add Todo Form */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200/30 dark:border-gray-700/30 mb-8">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                            placeholder="Add a new task..."
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={addTodo}
                            disabled={isSubmitting || !newTodo.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <PlusIcon className="w-5 h-5" />
                            )}
                            <span>{isSubmitting ? 'Adding...' : 'Add'}</span>
                        </button>
                    </div>
                </div>

                {/* Todo List */}
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading todos...</p>
                        </div>
                    ) : todos.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No tasks yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Add your first task to get started!
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                            {todos.map((todo, index) => (
                                <div 
                                    key={todo.id} 
                                    className={`p-4 transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 ${
                                        todo.completed ? 'opacity-75' : ''
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleTodo(todo.id)}
                                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                                todo.completed
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400'
                                            }`}
                                        >
                                            {todo.completed && <CheckIcon className="w-4 h-4" />}
                                        </button>

                                        {/* Todo Content */}
                                        <div className="flex-1 min-w-0">
                                            {editingId === todo.id ? (
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={editingText}
                                                        onChange={(e) => setEditingText(e.target.value)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') saveEdit();
                                                            if (e.key === 'Escape') cancelEdit();
                                                        }}
                                                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={saveEdit}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors duration-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className={`text-sm font-medium transition-all duration-200 ${
                                                        todo.completed
                                                            ? 'line-through text-gray-500 dark:text-gray-400'
                                                            : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                        {todo.text}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {new Date(todo.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {editingId !== todo.id && (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => startEditing(todo.id, todo.text)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteTodo(todo.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Todo; 