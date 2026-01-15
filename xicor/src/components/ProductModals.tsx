// components/ProductModals.tsx

import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../types';
import { X } from 'lucide-react';

interface ProductModalProps {
    show: boolean;
    product: Product | null;
    categories: Category[];
    onClose: () => void;
    onSave: (product: Omit<Product, 'id'> | Product) => void;
    mode: 'create' | 'edit';
}

export const ProductModal: React.FC<ProductModalProps> = ({
    show,
    product,
    categories,
    onClose,
    onSave,
    mode
}) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        nombre: '',
        categoria: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        stockCritico: 0,
        imagen: '',
        estado: 'disponible'
    });
    const [imagePreview, setImagePreview] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product && mode === 'edit') {
            setFormData({
                nombre: product.nombre,
                categoria: product.categoria,
                descripcion: product.descripcion,
                precio: product.precio,
                stock: product.stock,
                stockCritico: product.stockCritico,
                imagen: product.imagen,
                estado: product.estado
            });
            setImagePreview(product.imagen);
        } else {
            resetForm();
        }
    }, [product, mode, show]);

    const resetForm = () => {
        setFormData({
            nombre: '',
            categoria: '',
            descripcion: '',
            precio: 0,
            stock: 0,
            stockCritico: 0,
            imagen: '',
            estado: 'disponible'
        });
        setImagePreview('');
        setErrors({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'precio' || name === 'stock' || name === 'stockCritico'
                ? Number(value)
                : value
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
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setFormData(prev => ({ ...prev, imagen: result }));
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, imagen: url }));
        setImagePreview(url);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }
        if (!formData.categoria) {
            newErrors.categoria = 'Debes seleccionar una categoría';
        }
        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es obligatoria';
        }
        if (formData.precio <= 0) {
            newErrors.precio = 'El precio debe ser mayor a 0';
        }
        if (formData.stock < 0) {
            newErrors.stock = 'El stock no puede ser negativo';
        }
        if (formData.stockCritico < 0) {
            newErrors.stockCritico = 'El stock crítico no puede ser negativo';
        }
        if (!formData.imagen) {
            newErrors.imagen = 'Debes proporcionar una imagen';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        if (mode === 'edit' && product) {
            onSave({ ...formData, id: product.id } as Product);
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
                            {mode === 'create' ? 'Agregar Nuevo Producto' : 'Editar Producto'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={handleClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit} id="productForm">
                            <div className="row g-3">
                                {/* Nombre */}
                                <div className="col-md-6">
                                    <label className="form-label">Nombre del Producto *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                    />
                                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                                </div>

                                {/* Categoría */}
                                <div className="col-md-6">
                                    <label className="form-label">Categoría *</label>
                                    <select
                                        className={`form-select ${errors.categoria ? 'is-invalid' : ''}`}
                                        name="categoria"
                                        value={formData.categoria}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.nombre}>
                                                {cat.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoria && <div className="invalid-feedback">{errors.categoria}</div>}
                                </div>

                                {/* Descripción */}
                                <div className="col-md-12">
                                    <label className="form-label">Descripción *</label>
                                    <textarea
                                        className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                                        name="descripcion"
                                        rows={3}
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                    ></textarea>
                                    {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
                                </div>

                                {/* Precio */}
                                <div className="col-md-4">
                                    <label className="form-label">Precio *</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.precio ? 'is-invalid' : ''}`}
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                    {errors.precio && <div className="invalid-feedback">{errors.precio}</div>}
                                </div>

                                {/* Stock */}
                                <div className="col-md-4">
                                    <label className="form-label">Stock *</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                    {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                                </div>

                                {/* Stock Crítico */}
                                <div className="col-md-4">
                                    <label className="form-label">Stock Crítico *</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.stockCritico ? 'is-invalid' : ''}`}
                                        name="stockCritico"
                                        value={formData.stockCritico}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                    {errors.stockCritico && <div className="invalid-feedback">{errors.stockCritico}</div>}
                                </div>

                                {/* Imagen - File Upload */}
                                <div className="col-md-12">
                                    <label className="form-label">Imagen del Producto</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <small className="text-muted">Selecciona una imagen desde tu computadora</small>
                                </div>

                                {/* Imagen - URL */}
                                <div className="col-md-12">
                                    <label className="form-label">O ingresa URL de imagen:</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.imagen ? 'is-invalid' : ''}`}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        value={formData.imagen.startsWith('data:') ? '' : formData.imagen}
                                        onChange={handleImageUrlChange}
                                    />
                                    {errors.imagen && <div className="invalid-feedback">{errors.imagen}</div>}
                                </div>

                                {/* Preview de imagen */}
                                {imagePreview && (
                                    <div className="col-md-12">
                                        <label className="form-label">Vista Previa:</label>
                                        <div className="text-center">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '200px',
                                                    maxHeight: '200px',
                                                    objectFit: 'contain',
                                                    border: '2px solid #ddd',
                                                    borderRadius: '8px',
                                                    padding: '10px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Estado */}
                                <div className="col-md-12">
                                    <label className="form-label">Estado</label>
                                    <select
                                        className="form-select"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                    >
                                        <option value="disponible">Disponible</option>
                                        <option value="agotado">Agotado</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancelar
                        </button>
                        <button type="submit" form="productForm" className="btn btn-danger">
                            {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal para agregar stock
interface AddStockModalProps {
    show: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (productId: number, cantidad: number) => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
    show,
    product,
    onClose,
    onSave
}) => {
    const [cantidad, setCantidad] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cantidadNum = parseInt(cantidad);

        if (!cantidad || isNaN(cantidadNum) || cantidadNum <= 0) {
            setError('Debes ingresar una cantidad válida mayor a 0');
            return;
        }

        if (product) {
            onSave(product.id, cantidadNum);
            setCantidad('');
            setError('');
        }
    };

    const handleClose = () => {
        setCantidad('');
        setError('');
        onClose();
    };

    if (!show || !product) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title">Agregar Stock</h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={handleClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <p><strong>Producto:</strong> {product.nombre}</p>
                            <p><strong>Stock actual:</strong> {product.stock} unidades</p>
                            <p><strong>Stock crítico:</strong> {product.stockCritico} unidades</p>
                        </div>
                        <form onSubmit={handleSubmit} id="addStockForm">
                            <div className="mb-3">
                                <label className="form-label">Cantidad a agregar *</label>
                                <input
                                    type="number"
                                    className={`form-control ${error ? 'is-invalid' : ''}`}
                                    value={cantidad}
                                    onChange={(e) => {
                                        setCantidad(e.target.value);
                                        setError('');
                                    }}
                                    min="1"
                                    placeholder="Ej: 50"
                                    autoFocus
                                />
                                {error && <div className="invalid-feedback">{error}</div>}
                            </div>
                            {cantidad && !isNaN(parseInt(cantidad)) && parseInt(cantidad) > 0 && (
                                <div className="alert alert-info">
                                    <strong>Nuevo stock:</strong> {product.stock + parseInt(cantidad)} unidades
                                </div>
                            )}
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            Cancelar
                        </button>
                        <button type="submit" form="addStockForm" className="btn btn-success">
                            Agregar Stock
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};