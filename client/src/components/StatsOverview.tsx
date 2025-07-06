
import { Card } from '@/components/ui/card';
import { Star, Bell, Check, Clock } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalPoints: number;
    level: number;
    completedToday: number;
    totalHabits: number;
    longestStreak: number;
  };
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const progressToNextLevel = (stats.totalPoints % 100) / 100 * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Points & Level */}
      <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">{stats.totalPoints}</span>
        </div>
        <h3 className="text-lg font-semibold mb-1">Level {stats.level}</h3>
        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
          <div 
            className="h-2 bg-white rounded-full transition-all duration-500"
            style={{ width: `${progressToNextLevel}%` }}
          />
        </div>
        <p className="text-indigo-100 text-sm">{100 - Math.floor(progressToNextLevel)} points to next level</p>
      </Card>

      {/* Today's Progress */}
      <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">{stats.completedToday}/{stats.totalHabits}</span>
        </div>
        <h3 className="text-lg font-semibold mb-1">Today's Progress</h3>
        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
          <div 
            className="h-2 bg-white rounded-full transition-all duration-500"
            style={{ width: stats.totalHabits > 0 ? `${(stats.completedToday / stats.totalHabits) * 100}%` : '0%' }}
          />
        </div>
        <p className="text-green-100 text-sm">
          {stats.totalHabits - stats.completedToday} habits remaining
        </p>
      </Card>

      {/* Longest Streak */}
      <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">{stats.longestStreak}</span>
        </div>
        <h3 className="text-lg font-semibold mb-1">Longest Streak</h3>
        <p className="text-orange-100 text-sm">
          {stats.longestStreak >= 21 ? 'Incredible consistency! 🏆' : 
           stats.longestStreak >= 14 ? 'Great momentum! 🔥' :
           stats.longestStreak >= 7 ? 'Building strong habits! 💪' :
           'Keep going! 🌱'}
        </p>
      </Card>

      {/* Weekly Summary */}
      <Card className="p-6 bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">85%</span>
        </div>
        <h3 className="text-lg font-semibold mb-1">Weekly Success</h3>
        <p className="text-pink-100 text-sm">Above average performance this week!</p>
      </Card>
    </div>
  );
};
