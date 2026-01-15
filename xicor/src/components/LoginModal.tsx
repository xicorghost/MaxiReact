// components/LoginModal.tsx (CORREGIDO - Sin alert)

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onError: (message: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onClose, onSuccess, onError }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const success = login(email, password);

        if (success) {
            setEmail('');
            setPassword('');
            onSuccess();
            onClose();
        } else {
            onError('Correo o contraseña incorrectos');
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Iniciar Sesión</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-danger w-100">Ingresar</button>
                        </form>
                        <div className="mt-3 text-center">
                            <small className="text-muted">
                                <strong>Usuarios de prueba:</strong><br />
                                Admin: admin@maxigas.cl / Admin123<br />
                                Repartidor: repartidor@maxigas.cl / Repartidor123
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;