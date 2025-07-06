import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UpdateProfileRequest } from '../types/api';
import { authService } from '../services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: UpdateProfileRequest) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData);
        } catch (err) {
            console.error('Error loading user:', err);
            localStorage.removeItem('access_token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const response = await authService.login({ email, password });
            setUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during login');
            throw err;
        }
    };

    const register = async (email: string, username: string, password: string) => {
        try {
            setError(null);
            const response = await authService.register({ email, password, username });
            setUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during registration');
            throw err;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const updateProfile = async (data: UpdateProfileRequest) => {
        try {
            setError(null);
            const updatedUser = await authService.updateProfile(data);
            setUser(updatedUser);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
            throw err;
        }
    };

    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 