// components/admin/DashboardSection.tsx

import React from 'react';
import { ShoppingCart, Users, Truck, DollarSign } from 'lucide-react';
import type { Order, Product, DashboardStats } from '../../types';

interface DashboardSectionProps {
    stats: DashboardStats;
    orders: Order[];
    products: Product[];
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
    stats,
    orders,
    products
}) => {
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

    return (
        <div>
            <h2 className="mb-4">Dashboard General</h2>

            {/* Estadísticas */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <ShoppingCart className="text-warning mb-2" size={48} />
                            <h6>Pedidos Hoy</h6>
                            <h3 className="text-warning">{stats.pedidosHoy}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <Users className="text-primary mb-2" size={48} />
                            <h6>Usuarios</h6>
                            <h3 className="text-primary">{stats.totalUsuarios}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <Truck className="text-success mb-2" size={48} />
                            <h6>Repartidores</h6>
                            <h3 className="text-success">{stats.repartidoresActivos}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <DollarSign className="text-info mb-2" size={48} />
                            <h6>Ingresos Hoy</h6>
                            <h3 className="text-info">${stats.ingresosHoy.toLocaleString('es-CL')}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pedidos Recientes y Stock Bajo */}
            <div className="row">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-header bg-danger text-white">
                            <h5 className="mb-0">Pedidos Recientes</h5>
                        </div>
                        <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {orders.length === 0 ? (
                                <p className="text-muted text-center">No hay pedidos recientes</p>
                            ) : (
                                orders.slice(-5).reverse().map(order => (
                                    <div
                                        key={order.id}
                                        className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom"
                                    >
                                        <div>
                                            <strong>{order.numeroSolicitud}</strong><br />
                                            <small className="text-muted">{order.clienteNombre}</small>
                                        </div>
                                        <span className={`badge ${getBadgeClass(order.estado)}`}>
                                            {order.estado}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-header bg-danger text-white">
                            <h5 className="mb-0">Productos Stock Bajo</h5>
                        </div>
                        <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {products.filter(p => p.stock <= p.stockCritico).length === 0 ? (
                                <p className="text-success text-center">
                                    ✓ Todos los productos tienen stock suficiente
                                </p>
                            ) : (
                                products
                                    .filter(p => p.stock <= p.stockCritico)
                                    .map(product => (
                                        <div key={product.id} className="alert alert-warning mb-2 py-2">
                                            <strong>{product.nombre}:</strong> {product.stock} unidades
                                            <span className="text-danger"> (Crítico: {product.stockCritico})</span>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};