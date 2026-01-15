// components/RegisterModal.tsx (CORREGIDO - Sin alert)

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ValidationService from '../services/validationService';

interface RegisterModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onError: (message: string) => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ show, onClose, onSuccess, onError }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        rut: '',
        fechaNacimiento: '',
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (!ValidationService.validarTexto(formData.nombre)) {
            onError('El nombre solo debe contener letras');
            return;
        }

        if (!ValidationService.validarTexto(formData.apellidos)) {
            onError('Los apellidos solo deben contener letras');
            return;
        }

        if (!ValidationService.validarRUT(formData.rut)) {
            onError('El RUT ingresado no es válido');
            return;
        }

        if (!ValidationService.validarEdad(formData.fechaNacimiento)) {
            onError('Debes ser mayor de 18 años');
            return;
        }

        if (!ValidationService.validarEmail(formData.email)) {
            onError('El correo electrónico no es válido');
            return;
        }

        if (!ValidationService.validarContrasena(formData.password)) {
            onError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número');
            return;
        }

        const success = register({
            ...formData,
            rol: 'cliente'
        });

        if (success) {
            setFormData({
                nombre: '',
                apellidos: '',
                rut: '',
                fechaNacimiento: '',
                email: '',
                password: ''
            });
            onSuccess();
            onClose();
        } else {
            onError('Ya existe un usuario con este correo o RUT');
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">Crear Cuenta</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Apellidos *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">RUT *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="rut"
                                        placeholder="12.345.678-9"
                                        value={formData.rut}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Fecha de Nacimiento *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="fechaNacimiento"
                                        value={formData.fechaNacimiento}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Contraseña *</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        placeholder="Mínimo 8 caracteres"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-danger w-100 mt-3">Registrarse</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;