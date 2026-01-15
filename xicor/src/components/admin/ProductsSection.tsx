// components/admin/ProductsSection.tsx

import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Product, Category } from '../../types';
import { ProductModal, AddStockModal } from '../ProductModals';

interface ProductsSectionProps {
    products: Product[];
    categories: Category[];
    onSave: (productData: Omit<Product, 'id'> | Product) => void;
    onDelete: (product: Product) => void;
    onAddStock: (productId: number, cantidad: number) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
    products,
    categories,
    onSave,
    onDelete,
    onAddStock
}) => {
    const [showProductModal, setShowProductModal] = useState(false);
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');

    const handleCreateProduct = () => {
        setSelectedProduct(null);
        setProductModalMode('create');
        setShowProductModal(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setProductModalMode('edit');
        setShowProductModal(true);
    };

    const handleOpenAddStock = (product: Product) => {
        setSelectedProduct(product);
        setShowAddStockModal(true);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Gestión de Productos</h2>
                <button className="btn btn-danger" onClick={handleCreateProduct}>
                    <Plus size={18} className="me-2" />
                    Agregar Producto
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover bg-white">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Stock Crítico</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <img
                                        src={product.imagen}
                                        alt={product.nombre}
                                        style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                    />
                                </td>
                                <td><strong>{product.nombre}</strong></td>
                                <td>{product.categoria}</td>
                                <td className="fw-bold text-primary">${product.precio.toLocaleString('es-CL')}</td>
                                <td>{product.stock}</td>
                                <td className="text-danger">{product.stockCritico}</td>
                                <td>
                                    {product.stock > product.stockCritico ? (
                                        <span className="badge bg-success">Disponible</span>
                                    ) : product.stock > 0 ? (
                                        <span className="badge bg-warning text-dark">Stock Bajo</span>
                                    ) : (
                                        <span className="badge bg-danger">Agotado</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-primary me-1"
                                        onClick={() => handleEditProduct(product)}
                                        title="Editar"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-success me-1"
                                        onClick={() => handleOpenAddStock(product)}
                                        title="Agregar Stock"
                                    >
                                        <Plus size={14} />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => onDelete(product)}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modales */}
            <ProductModal
                show={showProductModal}
                product={selectedProduct}
                categories={categories}
                onClose={() => {
                    setShowProductModal(false);
                    setSelectedProduct(null);
                }}
                onSave={(productData) => {
                    onSave(productData);
                    setShowProductModal(false);
                    setSelectedProduct(null);
                }}
                mode={productModalMode}
            />

            <AddStockModal
                show={showAddStockModal}
                product={selectedProduct}
                onClose={() => {
                    setShowAddStockModal(false);
                    setSelectedProduct(null);
                }}
                onSave={(productId, cantidad) => {
                    onAddStock(productId, cantidad);
                    setShowAddStockModal(false);
                    setSelectedProduct(null);
                }}
            />
        </div>
    );
};