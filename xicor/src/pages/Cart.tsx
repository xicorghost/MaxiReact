// pages/Cart.tsx

import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import type { CartItem } from '../types';

interface CartProps {
    cart: CartItem[];
    onUpdateQuantity: (productId: number, change: number) => boolean;
    onRemoveItem: (productId: number) => void;
    onCheckout: (orderData: OrderData) => void;
    onBack: () => void;
}

interface OrderData {
    direccion: string;
    comuna: string;
    telefono: string;
    metodoPago: string;
}

const Cart: React.FC<CartProps> = ({ cart, onUpdateQuantity, onRemoveItem, onCheckout, onBack }) => {
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [orderData, setOrderData] = useState<OrderData>({
        direccion: '',
        comuna: '',
        telefono: '',
        metodoPago: ''
    });

    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const envio = 2990;
    const total = subtotal + envio;

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        onCheckout(orderData);
        setShowCheckoutForm(false);
        setOrderData({
            direccion: '',
            comuna: '',
            telefono: '',
            metodoPago: ''
        });
    };

    return (
        <div className="container my-5">
            <h2 className="text-danger mb-4">
                <ShoppingCart size={32} className="me-2" />
                Carrito de Compras
            </h2>
            <button className="btn btn-secondary mb-4" onClick={onBack}>
                ← Volver
            </button>

            {cart.length === 0 ? (
                <div className="alert alert-info text-center">
                    <ShoppingCart size={48} className="mb-3" />
                    <p className="mb-0">Tu carrito está vacío</p>
                </div>
            ) : (
                <div className="row">
                    <div className="col-lg-8 mb-4">
                        {cart.map(item => (
                            <div key={item.id} className="card mb-3 shadow-sm">
                                <div className="row g-0">
                                    <div className="col-md-2 d-flex align-items-center">
                                        <img
                                            src={item.imagen}
                                            className="img-fluid p-3"
                                            alt={item.nombre}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                    <div className="col-md-10">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h5 className="card-title">{item.nombre}</h5>
                                                    <p className="text-muted mb-0">${item.precio.toLocaleString('es-CL')} c/u</p>
                                                </div>
                                                <div className="text-end">
                                                    <div className="btn-group mb-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-secondary" disabled>
                                                            {item.cantidad}
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() => {
                                                                const success = onUpdateQuantity(item.id, 1);
                                                                if (!success) {
                                                                    alert('No hay suficiente stock disponible');
                                                                }
                                                            }}
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    <p className="fw-bold fs-5 text-primary mb-2">
                                                        ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                                                    </p>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => onRemoveItem(item.id)}
                                                    >
                                                        <Trash2 size={16} className="me-1" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow sticky-top" style={{ top: '90px' }}>
                            <div className="card-header bg-danger text-white">
                                <h5 className="mb-0">Resumen de Compra</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span className="fw-bold">${subtotal.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Envío:</span>
                                    <span className="fw-bold">$2.990</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fs-5 fw-bold">
                                    <span>Total:</span>
                                    <span className="text-danger">${total.toLocaleString('es-CL')}</span>
                                </div>
                                <button
                                    className="btn btn-danger w-100 mt-3"
                                    onClick={() => setShowCheckoutForm(true)}
                                >
                                    Proceder al Pago
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Checkout */}
            {showCheckoutForm && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Confirmar Pedido</h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowCheckoutForm(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCheckout}>
                                    <div className="mb-3">
                                        <label className="form-label">Dirección de Entrega *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={orderData.direccion}
                                            onChange={(e) => setOrderData({ ...orderData, direccion: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Comuna *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={orderData.comuna}
                                            onChange={(e) => setOrderData({ ...orderData, comuna: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Teléfono de Contacto *</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="+56 9 1234 5678"
                                            value={orderData.telefono}
                                            onChange={(e) => setOrderData({ ...orderData, telefono: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Método de Pago *</label>
                                        <select
                                            className="form-select"
                                            value={orderData.metodoPago}
                                            onChange={(e) => setOrderData({ ...orderData, metodoPago: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="efectivo">Efectivo al recibir</option>
                                            <option value="transferencia">Transferencia</option>
                                            <option value="tarjeta">Tarjeta</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-danger w-100">Confirmar Pedido</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;