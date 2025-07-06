// User Types
export interface User {
    id: number;
    email: string;
    username: string;
    points: number;
    level: number;
    created_at: string;
    last_login: string | null;
    notification_preferences: NotificationPreferences;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

// Habit Types
export interface Habit {
    id: number;
    user_id: number;
    title: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    reminder_time: string;
    current_streak: number;
    longest_streak: number;
    last_completed: string | null;
    is_active: boolean;
    created_at: string;
}

export interface HabitCompletion {
    id: number;
    habit_id: number;
    completed_at: string;
}

export interface HabitStats {
    total_habits: number;
    active_habits: number;
    total_streaks: number;
    longest_streak: number;
    completion_rate_30d: number;
}

// Notification Types
export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'email' | 'push' | 'both';
    status: 'pending' | 'sent' | 'failed';
    created_at: string;
    sent_at: string | null;
    read_at: string | null;
}

// API Request Types
export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface CreateHabitRequest {
    title: string;
    description?: string;
    frequency: HabitFrequency;
    reminder_time?: string;
}

export interface UpdateHabitRequest {
    title?: string;
    description?: string;
    frequency?: HabitFrequency;
    reminder_time?: string;
    is_active?: boolean;
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    reminder_time: string;
}

export interface UpdateProfileRequest {
    username?: string;
    email?: string;
    password?: string;
    notification_preferences?: NotificationPreferences;
}

// Todo Types
export interface Todo {
    id: number;
    user_id: number;
    text: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface TodoStats {
    total: number;
    completed: number;
    pending: number;
}

export interface CreateTodoRequest {
    text: string;
    completed?: boolean;
}

export interface UpdateTodoRequest {
    text?: string;
    completed?: boolean;
} 