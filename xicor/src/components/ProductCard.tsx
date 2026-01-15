// components/ProductCard.tsx

import React from 'react';
import { ShoppingCart, Package, XCircle } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    disabled?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, disabled = false }) => {
    const isLowStock = product.stock <= product.stockCritico && product.stock > 0;
    const isOutOfStock = product.stock === 0;

    return (
        <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover-shadow transition">
                <img
                    src={product.imagen}
                    className="card-img-top p-4"
                    alt={product.nombre}
                    style={{ height: '250px', objectFit: 'contain' }}
                />
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-danger fw-bold">{product.nombre}</h5>
                    <p className="card-text text-muted">{product.descripcion}</p>
                    <p className="fs-3 fw-bold text-primary mb-2">
                        ${product.precio.toLocaleString('es-CL')}
                    </p>
                    <p className={`small mb-3 ${isLowStock ? 'text-warning' : isOutOfStock ? 'text-danger' : 'text-muted'}`}>
                        <Package size={16} className="me-1" />
                        Stock: {product.stock} unidades
                        {isLowStock && ' (Stock Bajo)'}
                        {isOutOfStock && ' (Agotado)'}
                    </p>
                    <div className="mt-auto">
                        {!isOutOfStock ? (
                            <button
                                className="btn btn-danger w-100"
                                onClick={() => onAddToCart(product)}
                                disabled={disabled}
                            >
                                <ShoppingCart size={18} className="me-2" />
                                Agregar al Carrito
                            </button>
                        ) : (
                            <button className="btn btn-secondary w-100" disabled>
                                <XCircle size={18} className="me-2" />
                                Agotado
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;