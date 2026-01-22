// context/AuthContext.tsx (SESIONES INDEPENDIENTES POR PESTAÑA)

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import StorageService from '../services/storageService';
import JWTService from '../services/jwtService';
import StorageSyncService from '../services/storageSyncService';

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Cargar usuario desde sessionStorage (específico de esta pestaña)
        loadUserFromToken();

        // Iniciar sincronización de DATOS (no sesiones)
        StorageSyncService.startListening();

        // Suscribirse solo a cambios de DATOS
        const unsubscribe = StorageSyncService.subscribe(() => {
            console.log('🔄 Actualizando datos del usuario actual...');
            
            // Si hay un usuario logueado, recargar sus datos actualizados
            if (currentUser) {
                const updatedUser = StorageService.findUserById(currentUser.id);
                if (updatedUser) {
                    setCurrentUser(updatedUser);
                    StorageService.setCurrentUser(updatedUser);
                }
            }
        });

        // Verificar token cada 5 minutos
        const interval = setInterval(() => {
            if (currentUser) {
                JWTService.refreshTokenIfNeeded(currentUser);
            }
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(interval);
            unsubscribe();
            StorageSyncService.stopListening();
        };
    }, []);

    // Actualizar cuando cambia el usuario
    useEffect(() => {
        if (currentUser) {
            JWTService.refreshTokenIfNeeded(currentUser);
        }
    }, [currentUser]);

    const loadUserFromToken = () => {
        // sessionStorage es específico de cada pestaña
        if (JWTService.isAuthenticated()) {
            const userId = JWTService.getCurrentUserId();
            if (userId) {
                const user = StorageService.findUserById(userId);
                if (user) {
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                    StorageService.setCurrentUser(user);
                    JWTService.refreshTokenIfNeeded(user);
                    console.log('✅ Sesión de esta pestaña:', {
                        userId: user.id,
                        rol: user.rol,
                        email: user.email
                    });
                } else {
                    logout();
                }
            }
        }
    };

    const login = (email: string, password: string): boolean => {
        const user = StorageService.findUserByEmail(email);

        if (user && user.password === password) {
            const token = JWTService.generateToken(user);
            JWTService.saveToken(token); // sessionStorage

            setCurrentUser(user);
            setIsAuthenticated(true);
            StorageService.setCurrentUser(user); // sessionStorage

            console.log('✅ Login en ESTA pestaña:', {
                userId: user.id,
                email: user.email,
                rol: user.rol
            });

            return true;
        }

        console.error('❌ Login fallido - Credenciales inválidas');
        return false;
    };

    const register = (userData: Omit<User, 'id' | 'fechaRegistro' | 'foto'>): boolean => {
        const existingUserByEmail = StorageService.findUserByEmail(userData.email);
        const existingUserByRut = StorageService.findUserByRut(userData.rut);

        if (existingUserByEmail || existingUserByRut) {
            console.error('❌ Registro fallido - Usuario ya existe');
            return false;
        }

        const newUser: User = {
            ...userData,
            id: Date.now(),
            fechaRegistro: new Date().toISOString(),
            foto: 'https://via.placeholder.com/150'
        };

        // Guardar en la lista de usuarios (localStorage - compartido)
        StorageService.createUser(newUser);

        // Autenticar en ESTA pestaña (sessionStorage)
        const token = JWTService.generateToken(newUser);
        JWTService.saveToken(token);

        setCurrentUser(newUser);
        setIsAuthenticated(true);
        StorageService.setCurrentUser(newUser);

        console.log('✅ Registro exitoso en ESTA pestaña:', {
            userId: newUser.id,
            email: newUser.email,
            rol: newUser.rol
        });

        // Notificar a otras pestañas sobre nuevo usuario
        StorageSyncService.triggerSync();

        return true;
    };

    const logout = (): void => {
        // Limpiar SOLO en esta pestaña
        JWTService.removeToken(); // sessionStorage
        setCurrentUser(null);
        setIsAuthenticated(false);
        StorageService.clearCurrentUser(); // sessionStorage
        
        console.log('✅ Sesión cerrada en ESTA pestaña');
    };

    const updateProfile = (userData: Partial<User>): void => {
        if (!currentUser) return;

        const updatedUser: User = {
            ...currentUser,
            ...userData
        };

        // Actualizar en la base de datos (localStorage - compartido)
        StorageService.updateUser(updatedUser);

        // Actualizar en esta pestaña (sessionStorage)
        setCurrentUser(updatedUser);
        StorageService.setCurrentUser(updatedUser);

        const newToken = JWTService.generateToken(updatedUser);
        JWTService.saveToken(newToken);

        console.log('✅ Perfil actualizado en ESTA pestaña');

        // Notificar a otras pestañas sobre cambio de datos
        StorageSyncService.triggerSync();
    };

    const value: AuthContextType = {
        currentUser,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated,
        isAdmin: currentUser?.rol === 'admin',
        isRepartidor: currentUser?.rol === 'repartidor',
        isCliente: currentUser?.rol === 'cliente'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};