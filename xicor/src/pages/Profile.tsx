// pages/Profile.tsx

import React, { useState, useEffect } from 'react';
import { User, Camera, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCustomModal } from '../components/CustomModals';
import { useToast } from '../components/ToastNotification';
import ValidationService from '../services/validationService';
import StorageService from '../services/storageService';

interface ProfileProps {
    onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
    const { currentUser, updateProfile } = useAuth();
    const { exito, error } = useCustomModal();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        telefono: '',
        direccion: '',
        comuna: ''
    });
    const [foto, setFoto] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (currentUser) {
            setFormData({
                nombre: currentUser.nombre,
                apellidos: currentUser.apellidos,
                telefono: currentUser.telefono || '',
                direccion: currentUser.direccion || '',
                comuna: currentUser.comuna || ''
            });
            setFoto(currentUser.foto || 'https://via.placeholder.com/150');
        }
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tamaño (máximo 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast('error', 'La imagen no puede superar los 2MB');
                return;
            }

            // Validar tipo
            if (!file.type.startsWith('image/')) {
                showToast('error', 'Solo se permiten archivos de imagen');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setFoto(result);
                showToast('success', 'Foto actualizada');
            };
            reader.readAsDataURL(file);
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

        if (formData.telefono && !ValidationService.validarTelefono(formData.telefono)) {
            newErrors.telefono = 'El formato del teléfono no es válido (ej: +56 9 1234 5678)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            showToast('error', 'Por favor corrige los errores en el formulario');
            return;
        }

        if (!currentUser) return;

        // Actualizar en context
        updateProfile({
            ...formData,
            foto
        });

        // Actualizar en localStorage
        const usuarios = StorageService.getAllUsers();
        const index = usuarios.findIndex(u => u.id === currentUser.id);
        if (index !== -1) {
            usuarios[index] = {
                ...usuarios[index],
                ...formData,
                foto
            };
            StorageService.setUsers(usuarios);
        }

        showToast('success', 'Perfil actualizado correctamente');
        await exito('¡Tus datos han sido actualizados exitosamente!');
    };

    if (!currentUser) return null;

    return (
        <div className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-danger">
                    <User size={32} className="me-2" />
                    Mi Perfil
                </h2>
                <button className="btn btn-secondary" onClick={onBack}>
                    <ArrowLeft size={18} className="me-2" />
                    Volver
                </button>
            </div>

            <div className="row">
                {/* Sidebar con foto */}
                <div className="col-md-3 mb-4">
                    <div className="card shadow text-center">
                        <div className="card-body">
                            <div className="position-relative d-inline-block mb-3">
                                <img
                                    src={foto}
                                    className="rounded-circle"
                                    width="150"
                                    height="150"
                                    alt="Foto de perfil"
                                    style={{ objectFit: 'cover' }}
                                />
                                <label
                                    className="position-absolute bottom-0 end-0 btn btn-danger rounded-circle p-2"
                                    style={{ cursor: 'pointer' }}
                                    title="Cambiar foto"
                                >
                                    <Camera size={20} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="d-none"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            <h5 className="mb-1">{currentUser.nombre} {currentUser.apellidos}</h5>
                            <p className="text-muted small mb-2">{currentUser.email}</p>
                            <span className="badge bg-primary">
                                {currentUser.rol.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Formulario de datos */}
                <div className="col-md-9">
                    <div className="card shadow">
                        <div className="card-header bg-danger text-white">
                            <h4 className="mb-0">Información Personal</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
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

                                    {/* RUT - Solo lectura */}
                                    <div className="col-md-6">
                                        <label className="form-label">RUT</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={currentUser.rut}
                                            disabled
                                        />
                                        <small className="text-muted">El RUT no se puede modificar</small>
                                    </div>

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

                                    {/* Email - Solo lectura */}
                                    <div className="col-md-12">
                                        <label className="form-label">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={currentUser.email}
                                            disabled
                                        />
                                        <small className="text-muted">El correo electrónico no se puede modificar</small>
                                    </div>

                                    {/* Fecha de registro - Solo lectura */}
                                    <div className="col-md-12">
                                        <label className="form-label">Miembro desde</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={new Date(currentUser.fechaRegistro).toLocaleDateString('es-CL', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 d-flex gap-2">
                                    <button type="submit" className="btn btn-danger">
                                        <Save size={18} className="me-2" />
                                        Guardar Cambios
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={onBack}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;