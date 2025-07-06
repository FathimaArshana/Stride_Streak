import axios from 'axios';
import type {
    AuthResponse,
    User,
    Habit,
    HabitStats,
    Notification,
    RegisterRequest,
    LoginRequest,
    CreateHabitRequest,
    UpdateHabitRequest,
    UpdateProfileRequest,
    Todo,
    CreateTodoRequest,
    UpdateTodoRequest,
    TodoStats
} from '../types/api';

// Determine the correct API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Extract error message from response
        let errorMessage = 'An unexpected error occurred';
        
        if (error.response?.data) {
            // Try to get the most specific error message available
            const data = error.response.data;
            if (data.message) {
                errorMessage = data.message;
            } else if (data.error) {
                errorMessage = data.error;
            } else if (typeof data === 'string') {
                errorMessage = data;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        // Handle 401 specifically
        if (error.response?.status === 401) {
            // Don't redirect on login/register endpoints to allow showing error messages
            const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                                 error.config?.url?.includes('/auth/register');
            
            if (!isAuthEndpoint) {
                // Token expired or invalid for other endpoints
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        }
        
        // Create a new error with the extracted message
        const enhancedError = new Error(errorMessage);
        enhancedError.name = 'APIError';
        
        return Promise.reject(enhancedError);
    }
);

// Auth Services
export const authService = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/register', data);
            localStorage.setItem('access_token', response.data.access_token);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', data);
            localStorage.setItem('access_token', response.data.access_token);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get<User>('/auth/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
        const response = await api.put<User>('/auth/profile', data);
        return response.data;
    },

    deleteAccount: async (): Promise<void> => {
        await api.delete('/auth/delete-account');
        localStorage.removeItem('access_token');
    },
};

// Habit Services
export const habitService = {
    createHabit: async (data: CreateHabitRequest): Promise<Habit> => {
        const response = await api.post<{ habit: Habit }>('/habits', data);
        return response.data.habit;
    },

    getHabits: async (): Promise<Habit[]> => {
        const response = await api.get<{ habits: Habit[] }>('/habits');
        return response.data.habits;
    },

    getHabit: async (id: number): Promise<Habit> => {
        const response = await api.get<Habit>(`/habits/${id}`);
        return response.data;
    },

    updateHabit: async (id: number, data: UpdateHabitRequest): Promise<Habit> => {
        const response = await api.put<{ habit: Habit }>(`/habits/${id}`, data);
        return response.data.habit;
    },

    deleteHabit: async (id: number): Promise<void> => {
        await api.delete(`/habits/${id}`);
    },

    completeHabit: async (id: number): Promise<{
        habit: Habit;
        points_earned: number;
        total_points: number;
        level: number;
    }> => {
        const response = await api.post<{
            habit: Habit;
            points_earned: number;
            total_points: number;
            level: number;
        }>(`/habits/${id}/complete`);
        return response.data;
    },

    getStats: async (): Promise<HabitStats> => {
        const response = await api.get<HabitStats>('/habits/stats');
        return response.data;
    },
};

// Notification Services
export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        const response = await api.get<{ notifications: Notification[] }>('/notifications');
        return response.data.notifications;
    },

    markAsRead: async (id: number): Promise<void> => {
        await api.post(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await api.post('/notifications/read-all');
    },

    sendReminders: async (): Promise<{ reminders_sent: number }> => {
        const response = await api.post<{ reminders_sent: number }>('/notifications/reminders');
        return response.data;
    },

    checkAchievements: async (): Promise<{
        achievements_found: number;
        notifications_sent: number;
    }> => {
        const response = await api.post<{
            achievements_found: number;
            notifications_sent: number;
        }>('/notifications/achievements');
        return response.data;
    },
};

// Todo Services
export const todoService = {
    getTodos: async (): Promise<Todo[]> => {
        const response = await api.get<{ todos: Todo[] }>('/todos');
        return response.data.todos;
    },

    createTodo: async (data: CreateTodoRequest): Promise<Todo> => {
        const response = await api.post<{ todo: Todo }>('/todos', data);
        return response.data.todo;
    },

    updateTodo: async (id: number, data: UpdateTodoRequest): Promise<Todo> => {
        const response = await api.put<{ todo: Todo }>(`/todos/${id}`, data);
        return response.data.todo;
    },

    deleteTodo: async (id: number): Promise<void> => {
        await api.delete(`/todos/${id}`);
    },

    getStats: async (): Promise<TodoStats> => {
        const response = await api.get<{ stats: TodoStats }>('/todos/stats');
        return response.data.stats;
    },
}; 