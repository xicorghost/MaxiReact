// components/ProtectedRoute.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import JWTService from '../services/jwtService';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'repartidor' | 'cliente';
    onUnauthorized?: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requiredRole,
    onUnauthorized 
}) => {
    const { currentUser, isAuthenticated } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        checkAuthorization();
    }, [currentUser, isAuthenticated, requiredRole]);

    const checkAuthorization = () => {
        // Verificar si hay un token válido
        if (!JWTService.isAuthenticated()) {
            console.warn('⚠️ Acceso denegado - No hay token válido');
            setIsAuthorized(false);
            if (onUnauthorized) {
                onUnauthorized();
            }
            return;
        }

        // Verificar si el usuario está autenticado
        if (!isAuthenticated || !currentUser) {
            console.warn('⚠️ Acceso denegado - Usuario no autenticado');
            setIsAuthorized(false);
            if (onUnauthorized) {
                onUnauthorized();
            }
            return;
        }

        // Verificar el rol si es necesario
        if (requiredRole && currentUser.rol !== requiredRole) {
            console.warn(`⚠️ Acceso denegado - Se requiere rol "${requiredRole}", usuario tiene rol "${currentUser.rol}"`);
            setIsAuthorized(false);
            if (onUnauthorized) {
                onUnauthorized();
            }
            return;
        }

        // Verificar que el token del usuario coincida
        const tokenUserId = JWTService.getCurrentUserId();
        if (tokenUserId !== currentUser.id) {
            console.error('❌ Token no coincide con el usuario actual');
            setIsAuthorized(false);
            if (onUnauthorized) {
                onUnauthorized();
            }
            return;
        }

        console.log('✅ Autorización exitosa:', {
            userId: currentUser.id,
            email: currentUser.email,
            rol: currentUser.rol,
            requiredRole: requiredRole || 'cualquiera'
        });

        setIsAuthorized(true);
    };

    // Mostrar loading mientras verifica
    if (isAuthorized === null) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-danger mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-muted">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Mostrar mensaje de acceso denegado
    if (!isAuthorized) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center">
                    <h4 className="alert-heading">🔒 Acceso Denegado</h4>
                    <p className="mb-0">
                        {!isAuthenticated 
                            ? 'Debes iniciar sesión para acceder a esta página.'
                            : requiredRole 
                                ? `Esta página requiere permisos de ${requiredRole}.`
                                : 'No tienes permisos para acceder a esta página.'
                        }
                    </p>
                </div>
            </div>
        );
    }

    // Renderizar contenido protegido
    return <>{children}</>;
};

export default ProtectedRoute;