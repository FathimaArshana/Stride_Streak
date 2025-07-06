
import { useState } from 'react';
import { Check, Clock, Star, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Habit } from '@/pages/Index';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

const categoryColors = {
  health: 'from-green-500 to-emerald-600',
  productivity: 'from-blue-500 to-cyan-600',
  mindfulness: 'from-purple-500 to-indigo-600',
  learning: 'from-orange-500 to-red-600',
  social: 'from-pink-500 to-rose-600'
};

const categoryIcons = {
  health: '💪',
  productivity: '⚡',
  mindfulness: '🧘',
  learning: '📚',
  social: '👥'
};

export const HabitCard = ({ habit, onToggle, onDelete }: HabitCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = () => {
    onToggle(habit.id);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 21) return 'text-purple-600';
    if (streak >= 14) return 'text-indigo-600';
    if (streak >= 7) return 'text-blue-600';
    if (streak >= 3) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStreakBg = (streak: number) => {
    if (streak >= 21) return 'bg-purple-100';
    if (streak >= 14) return 'bg-indigo-100';
    if (streak >= 7) return 'bg-blue-100';
    if (streak >= 3) return 'bg-green-100';
    return 'bg-gray-100';
  };

  return (
    <Card 
      className={`p-6 transition-all duration-300 border-0 shadow-sm hover:shadow-lg ${
        habit.completed 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500' 
          : 'bg-white hover:bg-gray-50 border-l-4 border-l-gray-200'
      } ${isHovered ? 'transform scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${categoryColors[habit.category]} flex items-center justify-center text-white text-lg shadow-lg`}>
              {categoryIcons[habit.category]}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold transition-colors ${
                habit.completed ? 'text-green-800' : 'text-gray-900'
              }`}>
                {habit.title}
              </h3>
              <p className="text-gray-600 text-sm">{habit.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Streak Counter */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStreakBg(habit.streak)}`}>
              <Star className={`w-4 h-4 ${getStreakColor(habit.streak)}`} />
              <span className={`text-sm font-semibold ${getStreakColor(habit.streak)}`}>
                {habit.streak} day{habit.streak !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Last completed */}
            {habit.lastCompleted && (
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-xs">
                  {habit.completed ? 'Completed today' : 'Last completed yesterday'}
                </span>
              </div>
            )}

            {/* Category badge */}
            <div className="px-2 py-1 bg-gray-100 rounded-full">
              <span className="text-xs font-medium text-gray-600 capitalize">
                {habit.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {/* Completion Button */}
          <Button
            onClick={handleToggle}
            variant={habit.completed ? "default" : "outline"}
            className={`w-12 h-12 rounded-full p-0 transition-all duration-300 ${
              habit.completed
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg animate-pulse-success'
                : 'border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-600 hover:text-green-600'
            }`}
          >
            {habit.completed ? (
              <Check className="w-6 h-6 animate-bounce-in" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-current" />
            )}
          </Button>

          {/* Reminder Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              habit.completed 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-gray-300 to-gray-400'
            }`}
            style={{ width: habit.completed ? '100%' : `${Math.min(habit.streak * 5, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Progress</span>
          <span>{habit.completed ? '100%' : `${Math.min(habit.streak * 5, 100)}%`}</span>
        </div>
      </div>
    </Card>
  );
};
