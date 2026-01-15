// components/admin/OrdersSection.tsx

import React, { useState } from 'react';
import type { Order, User } from '../../types';

interface OrdersSectionProps {
    orders: Order[];
    users: User[];
    onAsignarRepartidor: (pedidoId: number, repartidorId: number) => void;
    onCancelar: (numeroSolicitud: string) => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
    orders,
    users,
    onAsignarRepartidor,
    onCancelar
}) => {
    const [filtro, setFiltro] = useState<string>('Todos');

    const getBadgeClass = (estado: string) => {
        switch (estado) {
            case 'Pendiente': return 'bg-warning text-dark';
            case 'Asignado': return 'bg-info';
            case 'En Ruta': return 'bg-primary';
            case 'Entregado': return 'bg-success';
            case 'Cancelado': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const ordenesFiltradas = filtro === 'Todos'
        ? orders
        : orders.filter(o => o.estado === filtro);

    return (
        <div>
            <h2 className="mb-4">Gestión de Órdenes</h2>

            <div className="mb-3">
                <button
                    className={`btn btn-sm me-2 ${filtro === 'Todos' ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setFiltro('Todos')}
                >
                    Todos
                </button>
                <button
                    className={`btn btn-sm me-2 ${filtro === 'Pendiente' ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => setFiltro('Pendiente')}
                >
                    Pendientes
                </button>
                <button
                    className={`btn btn-sm me-2 ${filtro === 'En Ruta' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFiltro('En Ruta')}
                >
                    En Ruta
                </button>
                <button
                    className={`btn btn-sm ${filtro === 'Entregado' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setFiltro('Entregado')}
                >
                    Entregados
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-hover bg-white">
                    <thead>
                        <tr>
                            <th>N° Pedido</th>
                            <th>Cliente</th>
                            <th>Productos</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center text-muted py-4">
                                    No hay órdenes {filtro !== 'Todos' ? `en estado "${filtro}"` : ''}
                                </td>
                            </tr>
                        ) : (
                            ordenesFiltradas
                                .slice()
                                .reverse()
                                .map(order => (
                                    <tr key={order.id}>
                                        <td><strong>{order.numeroSolicitud}</strong></td>
                                        <td>{order.clienteNombre}</td>
                                        <td>
                                            <small>
                                                {order.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', ')}
                                            </small>
                                        </td>
                                        <td className="fw-bold text-primary">
                                            ${order.total.toLocaleString('es-CL')}
                                        </td>
                                        <td>
                                            <span className={`badge ${getBadgeClass(order.estado)}`}>
                                                {order.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <small>{new Date(order.fecha).toLocaleDateString('es-CL')}</small>
                                        </td>
                                        <td>
                                            {order.estado === 'Pendiente' && (
                                                <div className="d-flex gap-1">
                                                    <select
                                                        className="form-select form-select-sm"
                                                        style={{ maxWidth: '150px' }}
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                onAsignarRepartidor(order.id, parseInt(e.target.value));
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Asignar...</option>
                                                        {users
                                                            .filter(u => u.rol === 'repartidor')
                                                            .map(r => (
                                                                <option key={r.id} value={r.id}>
                                                                    {r.nombre} {r.apellidos}
                                                                </option>
                                                            ))}
                                                    </select>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => onCancelar(order.numeroSolicitud)}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            )}
                                            {order.estado !== 'Pendiente' && order.repartidorNombre && (
                                                <small className="text-muted">
                                                    Repartidor: {order.repartidorNombre}
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};