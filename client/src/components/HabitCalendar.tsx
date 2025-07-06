import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Target, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HabitCalendarProps {
    habits: any[];
    onDateSelect?: (date: Date) => void;
    onHabitComplete?: (habitId: number, date: Date) => void;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    completions: number;
    totalHabits: number;
    habits: any[];
}

const HabitCalendar: React.FC<HabitCalendarProps> = ({ 
    habits = [], 
    onDateSelect, 
    onHabitComplete 
}) => {
    const { theme } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

    // Update current time every second for real-time display
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayNamesShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const getHabitsForDate = (date: Date) => {
            const dateString = date.toDateString();

            // Filter habits that should be done on this date
            const dayHabits = habits.filter(habit => {
                if (!habit.is_active) return false;
                
                if (habit.frequency === 'daily') return true;
                if (habit.frequency === 'weekly') {
                    // Weekly habits on Mondays (day 1)
                    return date.getDay() === 1;
                }
                if (habit.frequency === 'monthly') {
                    // Monthly habits on first day of month
                    return date.getDate() === 1;
                }
                return false;
            });

            // Count real completions for this date
            const completions = dayHabits.filter(habit => {
                if (!habit.last_completed) return false;
                const lastCompletedDate = new Date(habit.last_completed).toDateString();
                return lastCompletedDate === dateString;
            }).length;

        return {
            habits: dayHabits,
            completions,
            totalHabits: dayHabits.length
        };
    };

    const getCalendarDays = (): CalendarDay[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        
        // Adjust for Monday as first day of week
        const firstDayOfWeek = firstDay.getDay();
        const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        startDate.setDate(startDate.getDate() - mondayOffset);

        const days: CalendarDay[] = [];
        const today = new Date();

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayData = getHabitsForDate(date);

            days.push({
                date,
                isCurrentMonth: date.getMonth() === month,
                isToday: date.toDateString() === today.toDateString(),
                completions: dayData.completions,
                totalHabits: dayData.totalHabits,
                habits: dayData.habits
            });
        }

        return days;
    };

    const getWeekDays = (): CalendarDay[] => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const days: CalendarDay[] = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            const dayData = getHabitsForDate(date);

            days.push({
                date,
                isCurrentMonth: true, // All days in week view are considered current
                isToday: date.toDateString() === today.toDateString(),
                completions: dayData.completions,
                totalHabits: dayData.totalHabits,
                habits: dayData.habits
            });
        }

        return days;
    };

    const getDayData = (): CalendarDay => {
        const today = new Date();
        const dayData = getHabitsForDate(currentDate);
        
        return {
            date: currentDate,
            isCurrentMonth: true,
            isToday: currentDate.toDateString() === today.toDateString(),
            completions: dayData.completions,
            totalHabits: dayData.totalHabits,
            habits: dayData.habits
        };
    };

    const navigate = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (viewMode === 'month') {
            newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
            } else if (viewMode === 'week') {
                newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
            } else if (viewMode === 'day') {
                newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
            }
            return newDate;
        });
    };

    const handleDateClick = (day: CalendarDay) => {
        setSelectedDate(day.date);
        setCurrentDate(day.date);
        onDateSelect?.(day.date);
    };

    const getCompletionColor = (completions: number, total: number) => {
        if (total === 0) return 'bg-gray-100 dark:bg-gray-600';
        const percentage = completions / total;
        if (percentage === 1) return 'bg-green-500';
        if (percentage >= 0.7) return 'bg-green-300';
        if (percentage >= 0.5) return 'bg-yellow-300';
        if (percentage > 0) return 'bg-orange-300';
        return 'bg-red-200';
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getViewTitle = () => {
        if (viewMode === 'month') {
            return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
            } else {
                return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
            }
        } else {
            return currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    };

    const renderMonthView = () => {
    const calendarDays = getCalendarDays();

    return (
            <>
            <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`
                            relative p-2 min-h-[60px] border rounded-lg cursor-pointer transition-all hover:shadow-md
                            ${day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                            ${day.isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                            ${selectedDate.toDateString() === day.date.toDateString() ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : 'border-gray-200 dark:border-gray-600'}
                        `}
                    >
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${
                                    day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                                } ${day.isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>
                                    {day.date.getDate()}
                                </span>
                                {day.isToday && (
                                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                                )}
                            </div>

                            {/* Habit completion indicator */}
                            {day.totalHabits > 0 && (
                                <div className="flex-1 flex items-end">
                                    <div className="w-full">
                                        <div className={`
                                            w-full h-2 rounded-full ${getCompletionColor(day.completions, day.totalHabits)}
                                        `}></div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {day.completions}/{day.totalHabits}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            </>
        );
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays();
        
        return (
            <div className="space-y-4">
                {/* Week header */}
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, index) => (
                        <div key={index} className="text-center">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                {dayNames[index]}
                            </div>
                            <div className={`text-lg font-semibold ${
                                day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                            }`}>
                                {day.date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Week grid */}
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, index) => (
                        <div
                            key={index}
                            onClick={() => handleDateClick(day)}
                            className={`
                                p-4 min-h-[120px] border rounded-lg cursor-pointer transition-all hover:shadow-md
                                ${day.isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}
                                ${selectedDate.toDateString() === day.date.toDateString() ? 'border-blue-300 dark:border-blue-600' : 'border-gray-200 dark:border-gray-600'}
                            `}
                        >
                            <div className="space-y-2">
                                {/* Completion indicator */}
                                {day.totalHabits > 0 && (
                                    <div className="flex items-center justify-between">
                                        <div className={`
                                            flex-1 h-2 rounded-full ${getCompletionColor(day.completions, day.totalHabits)}
                                        `}></div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                            {day.completions}/{day.totalHabits}
                                        </span>
                                    </div>
                                )}

                                {/* Habits list */}
                                <div className="space-y-1">
                                    {day.habits.slice(0, 3).map(habit => (
                                        <div key={habit.id} className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                Math.random() > 0.3 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'
                                            }`}></div>
                                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                                {habit.title}
                                            </span>
                                        </div>
                                    ))}
                                    {day.habits.length > 3 && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            +{day.habits.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayData = getDayData();
        
        return (
            <div className="space-y-6">
                {/* Day header */}
                <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {currentDate.getDate()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                </div>

                {/* Day stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {dayData.totalHabits}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Scheduled</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {dayData.completions}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {dayData.totalHabits > 0 ? Math.round((dayData.completions / dayData.totalHabits) * 100) : 0}%
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">Success Rate</div>
                    </div>
                </div>

                {/* Habits timeline */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Habits</h4>
                    <div className="space-y-3">
                        {dayData.habits.length > 0 ? dayData.habits.map(habit => (
                            <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-4 h-4 rounded-full ${
                                        Math.random() > 0.3 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'
                                    }`}></div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{habit.title}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {habit.description || 'No description'}
                                        </div>
                                        {habit.reminder_time && (
                                            <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{habit.reminder_time}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onHabitComplete?.(habit.id, dayData.date)}
                                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Complete
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-500" />
                                <p>No habits scheduled for today</p>
                                <p className="text-sm mt-1">Take a rest day or add new habits!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            {/* Header with real-time clock */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Calendar</h2>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono">{formatTime(currentTime)}</span>
                    </div>
                </div>

                {/* View mode selector */}
                <div className="flex items-center space-x-2">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        {(['month', 'week', 'day'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === mode
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('prev')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {getViewTitle()}
                </h3>

                <button
                    onClick={() => navigate('next')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Calendar Views */}
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}

            {/* Selected date details - only show in month view */}
            {viewMode === 'month' && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Daily stats */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-blue-900 dark:text-blue-100">Daily Goals</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {habits.filter(h => h.frequency === 'daily').length}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">habits scheduled</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-green-900 dark:text-green-100">Completed</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {Math.floor(habits.length * 0.7)} {/* Mock completion */}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">habits done</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <span className="font-medium text-purple-900 dark:text-purple-100">Streak</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {Math.max(...habits.map(h => h.current_streak || 0), 0)}
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">days</div>
                    </div>
                </div>

                {/* Habits for selected date */}
                <div className="mt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Habits for this day:</h5>
                    <div className="space-y-2">
                        {habits.length > 0 ? habits.slice(0, 3).map(habit => (
                            <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                        Math.random() > 0.3 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-500'
                                    }`}></div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{habit.title}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                        {habit.frequency}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onHabitComplete?.(habit.id, selectedDate)}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                >
                                    Mark Complete
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-500" />
                                <p>No habits scheduled for this day</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}

            {/* Legend - only show in month view */}
            {viewMode === 'month' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Completion Rate Legend:</h5>
                <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>100%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-300 rounded"></div>
                        <span>70%+</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-300 rounded"></div>
                        <span>50%+</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-orange-300 rounded"></div>
                        <span>1-49%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-200 rounded"></div>
                        <span>0%</span>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default HabitCalendar; 