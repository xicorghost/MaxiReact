// components/admin/CategoriesSection.tsx

import React, { useState } from 'react';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';
import type { Category, Product } from '../../types';
import { CategoryModal } from '../CategoryModals';

interface CategoriesSectionProps {
    categories: Category[];
    products: Product[];
    onSave: (categoryData: Omit<Category, 'id' | 'productos'> | Category) => void;
    onDelete: (category: Category) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
    categories,
    products,
    onSave,
    onDelete
}) => {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');

    const handleCreateCategory = () => {
        setSelectedCategory(null);
        setCategoryModalMode('create');
        setShowCategoryModal(true);
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setCategoryModalMode('edit');
        setShowCategoryModal(true);
    };

    const getCategoryProductCount = (categoryName: string): number => {
        return products.filter(p => p.categoria === categoryName).length;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Gestión de Categorías</h2>
                <button className="btn btn-danger" onClick={handleCreateCategory}>
                    <Plus size={18} className="me-2" />
                    Agregar Categoría
                </button>
            </div>

            <div className="row g-4">
                {categories.map(cat => {
                    const productCount = getCategoryProductCount(cat.nombre);

                    return (
                        <div key={cat.id} className="col-md-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="text-danger mb-0">
                                            <Tag size={20} className="me-2" />
                                            {cat.nombre}
                                        </h5>
                                        <div>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-1"
                                                onClick={() => handleEditCategory(cat)}
                                                title="Editar"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => onDelete(cat)}
                                                title="Eliminar"
                                                disabled={productCount > 0}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-muted mb-3">{cat.descripcion}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="badge bg-primary">
                                            {productCount} {productCount === 1 ? 'producto' : 'productos'}
                                        </span>
                                        {productCount > 0 && (
                                            <small className="text-muted">
                                                No se puede eliminar
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {categories.length === 0 && (
                    <div className="col-12">
                        <div className="alert alert-info text-center">
                            <Tag size={48} className="mb-3" />
                            <p className="mb-0">No hay categorías registradas. ¡Crea la primera!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            <CategoryModal
                show={showCategoryModal}
                category={selectedCategory}
                onClose={() => {
                    setShowCategoryModal(false);
                    setSelectedCategory(null);
                }}
                onSave={(categoryData) => {
                    onSave(categoryData);
                    setShowCategoryModal(false);
                    setSelectedCategory(null);
                }}
                mode={categoryModalMode}
            />
        </div>
    );
};