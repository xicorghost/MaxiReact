// pages/Orders.tsx

import React from 'react';
import { Clock } from 'lucide-react';
import type { Order } from '../types';
import OrderCard from '../components/OrderCard';

interface OrdersProps {
    orders: Order[];
    onBack: () => void;
}

const Orders: React.FC<OrdersProps> = ({ orders, onBack }) => {
    return (
        <div className="container my-5">
            <h2 className="text-danger mb-4">
                <Clock size={32} className="me-2" />
                Mis Pedidos
            </h2>
            <button className="btn btn-secondary mb-4" onClick={onBack}>
                ← Volver
            </button>

            {orders.length === 0 ? (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle"></i> No tienes pedidos registrados
                </div>
            ) : (
                <div>
                    {orders.reverse().map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;