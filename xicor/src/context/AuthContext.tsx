// context/AuthContext.tsx

//import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import StorageService from '../services/storageService';

interface AuthContextType {
    currentUser: User | null;
    login: (email: string, password: string) => boolean;
    register: (userData: Omit<User, 'id' | 'fechaRegistro' | 'foto'>) => boolean;
    logout: () => void;
    updateProfile: (userData: Partial<User>) => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isRepartidor: boolean;
    isCliente: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        // Cargar usuario actual al iniciar
        const savedUser = StorageService.getCurrentUser();
        if (savedUser) {
            setCurrentUser(savedUser);
        }
    }, []);

    const login = (email: string, password: string): boolean => {
        const user = StorageService.findUserByEmail(email);

        if (user && user.password === password) {
            setCurrentUser(user);
            StorageService.setCurrentUser(user);
            return true;
        }

        return false;
    };

    const register = (userData: Omit<User, 'id' | 'fechaRegistro' | 'foto'>): boolean => {
        // Verificar si el usuario ya existe
        const existingUserByEmail = StorageService.findUserByEmail(userData.email);
        const existingUserByRut = StorageService.findUserByRut(userData.rut);

        if (existingUserByEmail || existingUserByRut) {
            return false;
        }

        const newUser: User = {
            ...userData,
            id: Date.now(),
            fechaRegistro: new Date().toISOString(),
            foto: 'https://via.placeholder.com/150'
        };

        StorageService.createUser(newUser);
        setCurrentUser(newUser);
        StorageService.setCurrentUser(newUser);

        return true;
    };

    const logout = (): void => {
        setCurrentUser(null);
        StorageService.clearCurrentUser();
    };

    const updateProfile = (userData: Partial<User>): void => {
        if (!currentUser) return;

        const updatedUser: User = {
            ...currentUser,
            ...userData
        };

        StorageService.updateUser(updatedUser);
        setCurrentUser(updatedUser);
        StorageService.setCurrentUser(updatedUser);
    };

    const value: AuthContextType = {
        currentUser,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.rol === 'admin',
        isRepartidor: currentUser?.rol === 'repartidor',
        isCliente: currentUser?.rol === 'cliente'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};