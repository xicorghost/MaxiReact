// components/Navbar.tsx

import React from 'react';
import { ShoppingCart, User, LogOut, Package, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
    cartCount: number;
    onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onNavigate }) => {
    const { currentUser, logout } = useAuth();

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
            logout();
            onNavigate('home');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
            <div className="container">
                <a className="navbar-brand fw-bold text-danger fs-4" href="#" onClick={() => onNavigate('home')}>
                    🔥 MAXIGAS
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {currentUser ? (
                            <>
                                <li className="nav-item me-3">
                                    <a
                                        className="nav-link position-relative"
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onNavigate('cart'); }}
                                    >
                                        <ShoppingCart size={24} />
                                        {cartCount > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                {cartCount}
                                            </span>
                                        )}
                                    </a>
                                </li>
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle d-flex align-items-center"
                                        href="#"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <User size={24} className="me-2" />
                                        <span>{currentUser.nombre}</span>
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <a
                                                className="dropdown-item"
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}
                                            >
                                                <User size={16} className="me-2" />
                                                Mi Perfil
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item"
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); onNavigate('orders'); }}
                                            >
                                                <Clock size={16} className="me-2" />
                                                Mis Pedidos
                                            </a>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <a
                                                className="dropdown-item text-danger"
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); handleLogout(); }}
                                            >
                                                <LogOut size={16} className="me-2" />
                                                Cerrar Sesión
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <button
                                    className="btn btn-outline-danger me-2"
                                    onClick={() => onNavigate('login')}
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => onNavigate('register')}
                                >
                                    Registrarse
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;