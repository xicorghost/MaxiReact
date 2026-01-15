// pages/Home.tsx

import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import StorageService from '../services/storageService';
import ProductCard from '../components/ProductCard';
import WhatsAppButton from '../components/WhatsAppButton';
import { useAuth } from '../context/AuthContext';

interface HomeProps {
    onAddToCart: (product: Product) => void;
}

const Home: React.FC<HomeProps> = ({ onAddToCart }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        const allProducts = StorageService.getProducts();
        setProducts(allProducts);
    };

    const handleAddToCart = (product: Product) => {
        if (!isAuthenticated) {
            alert('Debes iniciar sesión para agregar productos al carrito');
            return;
        }
        onAddToCart(product);
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-primary text-white text-center py-5 rounded mb-5">
                <div className="container">
                    <h1 className="display-4 fw-bold mb-3">Gas a Domicilio en Chile</h1>
                    <p className="lead">Pide tu cilindro de gas y recíbelo en tu hogar de forma rápida y segura</p>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-4">
                <div className="container">
                    <h2 className="text-center mb-5 text-danger fw-bold">Nuestros Productos</h2>

                    {products.length === 0 ? (
                        <div className="alert alert-info text-center">
                            <p className="mb-0">No hay productos disponibles en este momento</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    disabled={!isAuthenticated}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5 bg-light">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-4 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="text-danger mb-3">
                                        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                        </svg>
                                    </div>
                                    <h5 className="card-title">Entrega Rápida</h5>
                                    <p className="card-text text-muted">Recibe tu pedido en el menor tiempo posible</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="text-danger mb-3">
                                        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                                        </svg>
                                    </div>
                                    <h5 className="card-title">Productos de Calidad</h5>
                                    <p className="card-text text-muted">Cilindros certificados y seguros</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body">
                                    <div className="text-danger mb-3">
                                        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5z" />
                                        </svg>
                                    </div>
                                    <h5 className="card-title">Atención al Cliente</h5>
                                    <p className="card-text text-muted">Soporte disponible para ayudarte</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <WhatsAppButton />
        </div>
    );
};

export default Home;