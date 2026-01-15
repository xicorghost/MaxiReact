// components/OrderCard.tsx

import React from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import type { Order, OrderStatus } from '../types';

interface OrderCardProps {
    order: Order;
    onViewDetails?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails }) => {
    const getBadgeClass = (status: OrderStatus): string => {
        switch (status) {
            case 'Pendiente': return 'bg-warning text-dark';
            case 'Asignado': return 'bg-info';
            case 'En Ruta': return 'bg-primary';
            case 'Entregado': return 'bg-success';
            case 'Cancelado': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="card mb-3 shadow-sm">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                <span>
                    <strong>Pedido {order.numeroSolicitud}</strong>
                </span>
                <span className={`badge ${getBadgeClass(order.estado)}`}>
                    {order.estado}
                </span>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-8">
                        <p className="mb-2">
                            <Clock size={16} className="me-2" />
                            <strong>Fecha:</strong> {new Date(order.fecha).toLocaleString('es-CL')}
                        </p>
                        <p className="mb-2">
                            <MapPin size={16} className="me-2" />
                            <strong>Dirección:</strong> {order.direccion}, {order.comuna}
                        </p>
                        <p className="mb-2">
                            <Phone size={16} className="me-2" />
                            <strong>Teléfono:</strong> {order.telefono}
                        </p>
                        <p className="mb-2">
                            <strong>Productos:</strong>
                        </p>
                        <ul className="list-unstyled ms-3">
                            {order.productos.map((p, index) => (
                                <li key={index} className="mb-1">
                                    • {p.nombre} x{p.cantidad} - ${(p.precio * p.cantidad).toLocaleString('es-CL')}
                                </li>
                            ))}
                        </ul>
                        {order.repartidorNombre && (
                            <p className="mb-0 text-muted">
                                <strong>Repartidor:</strong> {order.repartidorNombre}
                            </p>
                        )}
                    </div>
                    <div className="col-md-4 text-end">
                        <p className="mb-2">
                            <strong>Subtotal:</strong> ${order.subtotal.toLocaleString('es-CL')}
                        </p>
                        <p className="mb-2">
                            <strong>Envío:</strong> ${order.envio.toLocaleString('es-CL')}
                        </p>
                        <hr />
                        <h5 className="text-primary mb-0">
                            <strong>Total:</strong> ${order.total.toLocaleString('es-CL')}
                        </h5>
                        {onViewDetails && (
                            <button
                                className="btn btn-outline-danger btn-sm mt-3"
                                onClick={() => onViewDetails(order)}
                            >
                                Ver Detalles
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCard;