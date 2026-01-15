// components/CategoryModals.tsx

import React, { useState, useEffect } from 'react';
import type { Category } from '../types';

interface CategoryModalProps {
    show: boolean;
    category: Category | null;
    onClose: () => void;
    onSave: (category: Omit<Category, 'id' | 'productos'> | Category) => void;
    mode: 'create' | 'edit';
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
    show,
    category,
    onClose,
    onSave,
    mode
}) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (category && mode === 'edit') {
            setFormData({
                nombre: category.nombre,
                descripcion: category.descripcion
            });
        } else {
            resetForm();
        }
    }, [category, mode, show]);

    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: ''
        });
        setErrors({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        } else if (formData.nombre.trim().length < 3) {
            newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es obligatoria';
        } else if (formData.descripcion.trim().length < 10) {
            newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        if (mode === 'edit' && category) {
            onSave({
                ...formData,
                id: category.id,
                productos: category.productos
            } as Category);
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
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">
                            {mode === 'create' ? 'Agregar Nueva Categoría' : 'Editar Categoría'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={handleClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit} id="categoryForm">
                            <div className="mb-3">
                                <label className="form-label">Nombre de la Categoría *</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: Gas Licuado"
                                />
                                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Descripción *</label>
                                <textarea
                                    className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                                    name="descripcion"
                                    rows={3}
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Describe la categoría..."
                                ></textarea>
                                {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
                            </div>

                            {mode === 'edit' && category && (
                                <div className="alert alert-info">
                                    <strong>Productos en esta categoría:</strong> {category.productos}
                                </div>
                            )}
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancelar
                        </button>
                        <button type="submit" form="categoryForm" className="btn btn-danger">
                            {mode === 'create' ? 'Crear Categoría' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};