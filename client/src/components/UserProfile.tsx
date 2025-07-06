
import { Card } from '@/components/ui/card';
import { Star, Bell } from 'lucide-react';

interface UserProfileProps {
  stats: {
    totalPoints: number;
    level: number;
    completedToday: number;
    totalHabits: number;
    longestStreak: number;
  };
}

export const UserProfile = ({ stats }: UserProfileProps) => {
  const progressToNextLevel = (stats.totalPoints % 100) / 100 * 100;

  return (
    <div className="flex items-center space-x-4">
      {/* Notifications */}
      <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
        <Bell className="w-5 h-5" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
      </button>

      {/* User Profile */}
      <Card className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-indigo-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">JD</span>
          </div>
          <div className="text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">Level {stats.level}</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-gray-700">{stats.totalPoints}</span>
              </div>
            </div>
            <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
