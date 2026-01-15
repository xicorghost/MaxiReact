// components/UserModals.tsx

import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import ValidationService from '../services/validationService';

interface UserModalProps {
    show: boolean;
    user: User | null;
    onClose: () => void;
    onSave: (user: Omit<User, 'id' | 'fechaRegistro' | 'foto'> | User) => void;
    mode: 'create' | 'edit';
}

export const UserModal: React.FC<UserModalProps> = ({
    show,
    user,
    onClose,
    onSave,
    mode
}) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        rut: '',
        fechaNacimiento: '',
        email: '',
        password: '',
        telefono: '',
        direccion: '',
        comuna: '',
        rol: 'cliente' as 'cliente' | 'repartidor' | 'admin'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user && mode === 'edit') {
            setFormData({
                nombre: user.nombre,
                apellidos: user.apellidos,
                rut: user.rut,
                fechaNacimiento: user.fechaNacimiento,
                email: user.email,
                password: user.password,
                telefono: user.telefono || '',
                direccion: user.direccion || '',
                comuna: user.comuna || '',
                rol: user.rol
            });
        } else {
            resetForm();
        }
    }, [user, mode, show]);

    const resetForm = () => {
        setFormData({
            nombre: '',
            apellidos: '',
            rut: '',
            fechaNacimiento: '',
            email: '',
            password: '',
            telefono: '',
            direccion: '',
            comuna: '',
            rol: 'cliente'
        });
        setErrors({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!ValidationService.validarTexto(formData.nombre)) {
            newErrors.nombre = 'El nombre solo debe contener letras';
        }

        if (!ValidationService.validarTexto(formData.apellidos)) {
            newErrors.apellidos = 'Los apellidos solo deben contener letras';
        }

        if (!ValidationService.validarRUT(formData.rut)) {
            newErrors.rut = 'El RUT ingresado no es válido';
        }

        if (!ValidationService.validarEdad(formData.fechaNacimiento)) {
            newErrors.fechaNacimiento = 'El usuario debe ser mayor de 18 años';
        }

        if (!ValidationService.validarEmail(formData.email)) {
            newErrors.email = 'El correo electrónico no es válido';
        }

        if (mode === 'create' && !ValidationService.validarContrasena(formData.password)) {
            newErrors.password = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número';
        }

        if (formData.telefono && !ValidationService.validarTelefono(formData.telefono)) {
            newErrors.telefono = 'El formato del teléfono no es válido (ej: +56 9 1234 5678)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        if (mode === 'edit' && user) {
            onSave({
                ...formData,
                id: user.id,
                fechaRegistro: user.fechaRegistro,
                foto: user.foto
            } as User);
        } else {
            onSave(formData);
        }

        resetForm();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">
                            {mode === 'create' ? 'Registrar Nuevo Usuario' : 'Editar Usuario'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={handleClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit} id="userForm">
                            <div className="row g-3">
                                {/* Nombre */}
                                <div className="col-md-6">
                                    <label className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                    />
                                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                                </div>

                                {/* Apellidos */}
                                <div className="col-md-6">
                                    <label className="form-label">Apellidos *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleChange}
                                    />
                                    {errors.apellidos && <div className="invalid-feedback">{errors.apellidos}</div>}
                                </div>

                                {/* RUT */}
                                <div className="col-md-6">
                                    <label className="form-label">RUT *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.rut ? 'is-invalid' : ''}`}
                                        name="rut"
                                        placeholder="12.345.678-9"
                                        value={formData.rut}
                                        onChange={handleChange}
                                        disabled={mode === 'edit'}
                                    />
                                    {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
                                </div>

                                {/* Fecha de Nacimiento */}
                                <div className="col-md-6">
                                    <label className="form-label">Fecha de Nacimiento *</label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.fechaNacimiento ? 'is-invalid' : ''}`}
                                        name="fechaNacimiento"
                                        value={formData.fechaNacimiento}
                                        onChange={handleChange}
                                    />
                                    {errors.fechaNacimiento && <div className="invalid-feedback">{errors.fechaNacimiento}</div>}
                                </div>

                                {/* Email */}
                                <div className="col-md-6">
                                    <label className="form-label">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={mode === 'edit'}
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>

                                {/* Contraseña */}
                                {mode === 'create' && (
                                    <div className="col-md-6">
                                        <label className="form-label">Contraseña *</label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            name="password"
                                            placeholder="Mínimo 8 caracteres"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </div>
                                )}

                                {/* Teléfono */}
                                <div className="col-md-6">
                                    <label className="form-label">Teléfono</label>
                                    <input
                                        type="tel"
                                        className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                                        name="telefono"
                                        placeholder="+56 9 1234 5678"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                    />
                                    {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                                </div>

                                {/* Dirección */}
                                <div className="col-md-6">
                                    <label className="form-label">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Comuna */}
                                <div className="col-md-6">
                                    <label className="form-label">Comuna</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="comuna"
                                        value={formData.comuna}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Rol */}
                                <div className="col-md-6">
                                    <label className="form-label">Tipo de Usuario *</label>
                                    <select
                                        className="form-select"
                                        name="rol"
                                        value={formData.rol}
                                        onChange={handleChange}
                                    >
                                        <option value="cliente">Cliente</option>
                                        <option value="repartidor">Repartidor</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                            </div>

                            {mode === 'edit' && (
                                <div className="alert alert-info mt-3">
                                    <strong>Nota:</strong> El RUT y el correo electrónico no se pueden modificar.
                                </div>
                            )}
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancelar
                        </button>
                        <button type="submit" form="userForm" className="btn btn-danger">
                            {mode === 'create' ? 'Registrar Usuario' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};