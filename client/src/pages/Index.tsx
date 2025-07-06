
import { useState, useEffect } from 'react';
import { HabitCard } from '@/components/HabitCard';
import { StatsOverview } from '@/components/StatsOverview';
import { AddHabitForm } from '@/components/AddHabitForm';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Habit {
  id: string;
  title: string;
  description: string;
  streak: number;
  completed: boolean;
  lastCompleted: string | null;
  createdAt: string;
  category: 'health' | 'productivity' | 'mindfulness' | 'learning' | 'social';
}

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      title: 'Morning Meditation',
      description: 'Start the day with 10 minutes of mindfulness',
      streak: 7,
      completed: true,
      lastCompleted: new Date().toISOString(),
      createdAt: '2024-01-01',
      category: 'mindfulness'
    },
    {
      id: '2',
      title: 'Read 30 Pages',
      description: 'Daily reading to expand knowledge',
      streak: 12,
      completed: false,
      lastCompleted: null,
      createdAt: '2024-01-01',
      category: 'learning'
    },
    {
      id: '3',
      title: 'Drink 8 Glasses of Water',
      description: 'Stay hydrated throughout the day',
      streak: 5,
      completed: false,
      lastCompleted: null,
      createdAt: '2024-01-01',
      category: 'health'
    },
    {
      id: '4',
      title: 'Write in Journal',
      description: 'Reflect on the day and set intentions',
      streak: 3,
      completed: true,
      lastCompleted: new Date().toISOString(),
      createdAt: '2024-01-01',
      category: 'mindfulness'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPoints: 245,
    level: 3,
    completedToday: 2,
    totalHabits: habits.length,
    longestStreak: Math.max(...habits.map(h => h.streak))
  });

  const { toast } = useToast();

  const toggleHabit = (habitId: string) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === habitId) {
          const wasCompleted = habit.completed;
          const newCompleted = !wasCompleted;
          
          if (newCompleted) {
            toast({
              title: "Habit Completed! 🎉",
              description: `Great job completing "${habit.title}"! Keep up the streak!`
            });
          }

          return {
            ...habit,
            completed: newCompleted,
            streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            lastCompleted: newCompleted ? new Date().toISOString() : null
          };
        }
        return habit;
      })
    );
  };

  const addHabit = (newHabit: Omit<Habit, 'id' | 'streak' | 'completed' | 'lastCompleted' | 'createdAt'>) => {
    const habit: Habit = {
      ...newHabit,
      id: Date.now().toString(),
      streak: 0,
      completed: false,
      lastCompleted: null,
      createdAt: new Date().toISOString()
    };
    
    setHabits(prev => [...prev, habit]);
    setShowAddForm(false);
    
    toast({
      title: "New Habit Added! ✨",
      description: `"${habit.title}" has been added to your habits.`
    });
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    toast({
      title: "Habit Removed",
      description: "The habit has been deleted from your tracker."
    });
  };

  // Update user stats when habits change
  useEffect(() => {
    const completedToday = habits.filter(h => h.completed).length;
    const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
    
    setUserStats(prev => ({
      ...prev,
      completedToday,
      totalHabits: habits.length,
      longestStreak
    }));
  }, [habits]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  HabitFlow
                </h1>
                <p className="text-sm text-gray-600">Build better habits, one day at a time</p>
              </div>
            </div>
            <UserProfile stats={userStats} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <StatsOverview stats={userStats} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Habits List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Today's Habits</h2>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Habit
              </Button>
            </div>

            {habits.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
                <p className="text-gray-600 mb-4">Start building better habits by adding your first one!</p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  Create Your First Habit
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {habits.map((habit, index) => (
                  <div
                    key={habit.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <HabitCard
                      habit={habit}
                      onToggle={toggleHabit}
                      onDelete={deleteHabit}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <span className="text-green-800 font-medium">Completed Today</span>
                  <span className="text-2xl font-bold text-green-600">{userStats.completedToday}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="text-blue-800 font-medium">Total Habits</span>
                  <span className="text-2xl font-bold text-blue-600">{userStats.totalHabits}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                  <span className="text-orange-800 font-medium">Longest Streak</span>
                  <span className="text-2xl font-bold text-orange-600">{userStats.longestStreak}</span>
                </div>
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">Daily Motivation</h3>
              <blockquote className="text-indigo-100 italic">
                "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
              </blockquote>
              <p className="text-indigo-200 mt-2 text-sm">— Aristotle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddForm && (
        <AddHabitForm
          onClose={() => setShowAddForm(false)}
          onAdd={addHabit}
        />
      )}
    </div>
  );
};

export default Index;
