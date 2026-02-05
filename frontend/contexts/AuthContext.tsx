'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { authAPI } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    login: (data: { email: string; password: string }) => Promise<void>;
    signup: (formData: FormData) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (data: { email: string; password: string }) => {
        const response = await authAPI.login(data);
        const { user, accessToken } = response.data;
        setUser(user);
        localStorage.setItem('accessToken', accessToken);
    };

    const signup = async (formData: FormData) => {
        const response = await authAPI.signup(formData);
        const { user, accessToken } = response.data;
        setUser(user);
        localStorage.setItem('accessToken', accessToken);
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
        localStorage.removeItem('accessToken');
    };

    const value = {
        user,
        login,
        signup,
        logout,
        isLoading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};