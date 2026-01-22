// pages/Repartidor.tsx (CON HISTORIAL Y SINCRONIZACIÓN)

import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, MapPin, Phone, User, Package } from 'lucide-react';
import type { Order } from '../types';
import StorageService from '../services/storageService';
import StorageSyncService from '../services/storageSyncService';
import { useAuth } from '../context/AuthContext';
import { useCustomModal } from '../components/CustomModals';
import WhatsAppButton from '../components/WhatsAppButton';

type HistorialType = 'pendientes' | 'completadas' | 'total' | null;

const Repartidor: React.FC = () => {
    const { currentUser, updateProfile, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [disponible, setDisponible] = useState(true);
    const [stats, setStats] = useState({
        pendientes: 0,
        completadas: 0,
        total: 0
    });
    const [showHistorialModal, setShowHistorialModal] = useState(false);
    const [historialType, setHistorialType] = useState<HistorialType>(null);
    const [historialOrders, setHistorialOrders] = useState<Order[]>([]);

    const {
        CustomModalComponent,
        exito,
        confirmar
    } = useCustomModal();

    useEffect(() => {
        if (currentUser) {
            setDisponible(currentUser.disponible ?? true);
            loadOrders();
            updateStats();
        }

        // Suscribirse a cambios de sincronización
        const unsubscribe = StorageSyncService.subscribe(() => {
            console.log('🔄 Repartidor: Recargando pedidos desde otra pestaña...');
            loadOrders();
            updateStats();
        });

        return () => unsubscribe();
    }, [currentUser]);

    const loadOrders = () => {
        if (!currentUser) return;

        const allOrders = StorageService.getOrders();
        const myOrders = allOrders.filter(
            o => o.repartidorAsignado === currentUser.id &&
                (o.estado === 'Asignado' || o.estado === 'En Ruta')
        );
        setOrders(myOrders);
    };

    const updateStats = () => {
        if (!currentUser) return;

        const allOrders = StorageService.getOrders();
        const today = new Date().toDateString();

        const pendientes = allOrders.filter(
            o => o.repartidorAsignado === currentUser.id &&
                (o.estado === 'Asignado' || o.estado === 'En Ruta')
        ).length;

        const completadas = allOrders.filter(
            o => o.repartidorAsignado === currentUser.id &&
                o.estado === 'Entregado' &&
                o.horaEntrega &&
                new Date(o.horaEntrega).toDateString() === today
        ).length;

        setStats({
            pendientes,
            completadas,
            total: pendientes + completadas
        });
    };

    const handleDisponibilidadChange = () => {
        const nuevoEstado = !disponible;
        setDisponible(nuevoEstado);

        if (currentUser) {
            updateProfile({ disponible: nuevoEstado });

            const usuarios = StorageService.getAllUsers();
            const index = usuarios.findIndex(u => u.id === currentUser.id);
            if (index !== -1) {
                usuarios[index].disponible = nuevoEstado;
                StorageService.setUsers(usuarios);
                StorageSyncService.triggerSync();
            }
        }
    };

    const handleIniciarRuta = async (numeroSolicitud: string) => {
        const confirmado = await confirmar('¿Confirmas que vas a iniciar la ruta de entrega?');
        if (!confirmado) return;

        const allOrders = StorageService.getOrders();
        const orderIndex = allOrders.findIndex(o => o.numeroSolicitud === numeroSolicitud);

        if (orderIndex !== -1) {
            allOrders[orderIndex].estado = 'En Ruta';
            allOrders[orderIndex].horaInicioRuta = new Date().toISOString();
            StorageService.setOrders(allOrders);

            loadOrders();
            updateStats();
            StorageSyncService.triggerSync();
            await exito('¡Ruta iniciada! Buena suerte con la entrega.');
        }
    };

    const handleCompletarEntrega = async (numeroSolicitud: string) => {
        const confirmado = await confirmar('¿Confirmas que el pedido ha sido entregado exitosamente?');
        if (!confirmado) return;

        const allOrders = StorageService.getOrders();
        const orderIndex = allOrders.findIndex(o => o.numeroSolicitud === numeroSolicitud);

        if (orderIndex !== -1) {
            allOrders[orderIndex].estado = 'Entregado';
            allOrders[orderIndex].horaEntrega = new Date().toISOString();
            StorageService.setOrders(allOrders);

            loadOrders();
            updateStats();
            StorageSyncService.triggerSync();
            await exito('¡Entrega confirmada! El pedido se ha marcado como entregado exitosamente.');
        }
    };

    const handleCerrarSesion = async () => {
        const confirmado = await confirmar('¿Estás seguro que deseas cerrar sesión?');
        if (confirmado) {
            logout();
            window.location.href = '/';
        }
    };

    const handleOpenHistorial = (type: HistorialType) => {
        if (!currentUser) return;

        const allOrders = StorageService.getOrders();
        const today = new Date().toDateString();
        let filteredOrders: Order[] = [];

        switch (type) {
            case 'pendientes':
                filteredOrders = allOrders.filter(
                    o => o.repartidorAsignado === currentUser.id &&
                        (o.estado === 'Asignado' || o.estado === 'En Ruta')
                );
                break;
            case 'completadas':
                filteredOrders = allOrders.filter(
                    o => o.repartidorAsignado === currentUser.id &&
                        o.estado === 'Entregado' &&
                        o.horaEntrega &&
                        new Date(o.horaEntrega).toDateString() === today
                );
                break;
            case 'total':
                filteredOrders = allOrders.filter(
                    o => o.repartidorAsignado === currentUser.id &&
                        new Date(o.fecha).toDateString() === today
                );
                break;
        }

        setHistorialOrders(filteredOrders);
        setHistorialType(type);
        setShowHistorialModal(true);
    };

    const getModalTitle = () => {
        switch (historialType) {
            case 'pendientes':
                return 'Entregas Pendientes';
            case 'completadas':
                return 'Entregas Completadas Hoy';
            case 'total':
                return 'Total de Entregas del Día';
            default:
                return 'Historial';
        }
    };

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

    if (!currentUser) return null;

    return (
        <div className="min-vh-100 bg-light">
            <nav className="navbar navbar-dark bg-danger shadow-sm">
                <div className="container-fluid">
                    <a className="navbar-brand fw-bold fs-4" href="#">
                        🔥 MAXIGAS - Repartidor
                    </a>
                    <button
                        className="btn btn-outline-light"
                        onClick={handleCerrarSesion}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="container my-4">
                <div className="text-center mb-4">
                    <h2 className="text-danger fw-bold">Panel de Entregas</h2>
                    <p className="lead">
                        Bienvenido, <span className="fw-bold text-primary">{currentUser.nombre} {currentUser.apellidos}</span>
                    </p>
                </div>

                <div className="card shadow-sm mb-4 border-info border-2">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="mb-1">
                                    <User className="me-2" />
                                    Estado de Disponibilidad
                                </h4>
                                <p className="text-muted mb-0">Indica si estás disponible para recibir pedidos</p>
                            </div>
                            <div className="form-check form-switch" style={{ transform: 'scale(1.5)' }}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={disponible}
                                    onChange={handleDisponibilidadChange}
                                />
                                <label className={`form-check-label ms-2 fw-bold ${disponible ? 'text-success' : 'text-danger'}`}>
                                    {disponible ? 'Disponible' : 'Ocupado'}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-md-4">
                        <div 
                            className="card shadow-sm border-warning border-2 h-100"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => handleOpenHistorial('pendientes')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="card-body text-center">
                                <Clock className="text-warning" size={48} />
                                <h3 className="mt-2">Entregas Pendientes</h3>
                                <p className="display-4 fw-bold text-warning mb-0">{stats.pendientes}</p>
                                <small className="text-muted">Click para ver detalles</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div 
                            className="card shadow-sm border-success border-2 h-100"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => handleOpenHistorial('completadas')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="card-body text-center">
                                <CheckCircle className="text-success" size={48} />
                                <h3 className="mt-2">Completadas Hoy</h3>
                                <p className="display-4 fw-bold text-success mb-0">{stats.completadas}</p>
                                <small className="text-muted">Click para ver detalles</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div 
                            className="card shadow-sm border-primary border-2 h-100"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => handleOpenHistorial('total')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="card-body text-center">
                                <Package className="text-primary" size={48} />
                                <h3 className="mt-2">Total del Día</h3>
                                <p className="display-4 fw-bold text-primary mb-0">{stats.total}</p>
                                <small className="text-muted">Click para ver detalles</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card shadow">
                    <div className="card-header bg-danger text-white">
                        <h4 className="mb-0">
                            <Truck className="me-2" />
                            Pedidos Asignados
                        </h4>
                    </div>
                    <div className="card-body">
                        {orders.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                <Package size={64} className="mb-3" />
                                <p className="fs-5">No tienes pedidos asignados en este momento</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="card mb-3 shadow-sm">
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 text-danger">Pedido {order.numeroSolicitud}</h5>
                                        <span className={`badge ${order.estado === 'En Ruta' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                                            {order.estado}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><User className="text-primary" size={16} /> <strong>Cliente:</strong> {order.clienteNombre}</p>
                                                <p><Phone className="text-success" size={16} /> <strong>Teléfono:</strong> {order.telefono}</p>
                                                <p><MapPin className="text-danger" size={16} /> <strong>Dirección:</strong></p>
                                                <p className="ms-4">{order.direccion}<br />{order.comuna}</p>
                                                <p><Clock className="text-info" size={16} /> <strong>Fecha:</strong> {new Date(order.fecha).toLocaleString('es-CL')}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><Package className="text-warning" size={16} /> <strong>Productos:</strong></p>
                                                <ul className="list-group mb-3">
                                                    {order.productos.map((p, idx) => (
                                                        <li key={idx} className="list-group-item d-flex justify-content-between">
                                                            <span>{p.nombre} x{p.cantidad}</span>
                                                            <span className="text-primary fw-bold">${(p.precio * p.cantidad).toLocaleString('es-CL')}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="alert alert-info">
                                                    <strong>Total:</strong> ${order.total.toLocaleString('es-CL')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-white d-flex justify-content-end gap-2">
                                        {order.estado === 'Asignado' ? (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleIniciarRuta(order.numeroSolicitud)}
                                            >
                                                <Truck size={18} className="me-2" />
                                                Iniciar Ruta
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleCompletarEntrega(order.numeroSolicitud)}
                                            >
                                                <CheckCircle size={18} className="me-2" />
                                                Marcar Entregado
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {showHistorialModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    <Package className="me-2" size={20} />
                                    {getModalTitle()}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowHistorialModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {historialOrders.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <Package size={64} className="mb-3" />
                                        <p className="fs-5">No hay entregas en esta categoría</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>N° Pedido</th>
                                                    <th>Cliente</th>
                                                    <th>Dirección</th>
                                                    <th>Productos</th>
                                                    <th>Total</th>
                                                    <th>Estado</th>
                                                    <th>Fecha</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historialOrders
                                                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                                                    .map(order => (
                                                    <tr key={order.id}>
                                                        <td><strong>{order.numeroSolicitud}</strong></td>
                                                        <td>
                                                            {order.clienteNombre}<br />
                                                            <small className="text-muted">{order.telefono}</small>
                                                        </td>
                                                        <td>
                                                            <small>
                                                                {order.direccion}<br />
                                                                {order.comuna}
                                                            </small>
                                                        </td>
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
                                                            <small>
                                                                {new Date(order.fecha).toLocaleDateString('es-CL')}
                                                                <br />
                                                                {new Date(order.fecha).toLocaleTimeString('es-CL', { 
                                                                    hour: '2-digit', 
                                                                    minute: '2-digit' 
                                                                })}
                                                            </small>
                                                            {order.horaEntrega && (
                                                                <>
                                                                    <br />
                                                                    <small className="text-success">
                                                                        ✓ {new Date(order.horaEntrega).toLocaleTimeString('es-CL', { 
                                                                            hour: '2-digit', 
                                                                            minute: '2-digit' 
                                                                        })}
                                                                    </small>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <div className="me-auto">
                                    <strong>Total de entregas:</strong> {historialOrders.length}
                                    {historialType === 'total' && (
                                        <span className="ms-3">
                                            | <strong>Ingresos:</strong> ${historialOrders
                                                .filter(o => o.estado === 'Entregado')
                                                .reduce((sum, o) => sum + o.total, 0)
                                                .toLocaleString('es-CL')}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowHistorialModal(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <WhatsAppButton
                phoneNumber="56912345691"
                message="Hola, necesito soporte con administración"
                text="SOPORTE ADMINISTRACIÓN"
            />

            <footer className="bg-dark text-white text-center py-3 mt-5">
                <p className="mb-0">&copy; 2025 MaxiGas - Panel Repartidor</p>
            </footer>

            <CustomModalComponent />
        </div>
    );
};

export default Repartidor;