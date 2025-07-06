
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Habit } from '@/pages/Index';

interface AddHabitFormProps {
  onClose: () => void;
  onAdd: (habit: Omit<Habit, 'id' | 'streak' | 'completed' | 'lastCompleted' | 'createdAt'>) => void;
}

const categories = [
  { value: 'health', label: 'Health & Fitness', icon: '💪', color: 'from-green-500 to-emerald-600' },
  { value: 'productivity', label: 'Productivity', icon: '⚡', color: 'from-blue-500 to-cyan-600' },
  { value: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: 'from-purple-500 to-indigo-600' },
  { value: 'learning', label: 'Learning', icon: '📚', color: 'from-orange-500 to-red-600' },
  { value: 'social', label: 'Social', icon: '👥', color: 'from-pink-500 to-rose-600' }
] as const;

export const AddHabitForm = ({ onClose, onAdd }: AddHabitFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'health' as Habit['category']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onAdd(formData);
      setFormData({ title: '', description: '', category: 'health' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-0 animate-slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Habit</h2>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Habit Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Drink 8 glasses of water"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your habit"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Category</Label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.category === category.value
                        ? `border-indigo-500 bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-xs font-medium">{category.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Habit
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
