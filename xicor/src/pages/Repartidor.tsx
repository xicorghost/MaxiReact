// pages/Repartidor.tsx (CORREGIDO)

import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, MapPin, Phone, User, Package } from 'lucide-react';
import type { Order } from '../types';
import StorageService from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useCustomModal } from '../components/CustomModals';
import WhatsAppButton from '../components/WhatsAppButton';

const Repartidor: React.FC = () => {
    const { currentUser, updateProfile, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [disponible, setDisponible] = useState(true);
    const [stats, setStats] = useState({
        pendientes: 0,
        completadas: 0,
        total: 0
    });

    // Sistema de modales personalizados
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

            // Actualizar en la lista de usuarios
            const usuarios = StorageService.getAllUsers();
            const index = usuarios.findIndex(u => u.id === currentUser.id);
            if (index !== -1) {
                usuarios[index].disponible = nuevoEstado;
                StorageService.setUsers(usuarios);
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

    if (!currentUser) return null;

    return (
        <div className="min-vh-100 bg-light">
            {/* Navbar */}
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
                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="text-danger fw-bold">Panel de Entregas</h2>
                    <p className="lead">
                        Bienvenido, <span className="fw-bold text-primary">{currentUser.nombre} {currentUser.apellidos}</span>
                    </p>
                </div>

                {/* Estado de Disponibilidad */}
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

                {/* Estadísticas */}
                <div className="row g-4 mb-4">
                    <div className="col-md-4">
                        <div className="card shadow-sm border-warning border-2">
                            <div className="card-body text-center">
                                <Clock className="text-warning" size={48} />
                                <h3 className="mt-2">Entregas Pendientes</h3>
                                <p className="display-4 fw-bold text-warning mb-0">{stats.pendientes}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm border-success border-2">
                            <div className="card-body text-center">
                                <CheckCircle className="text-success" size={48} />
                                <h3 className="mt-2">Completadas Hoy</h3>
                                <p className="display-4 fw-bold text-success mb-0">{stats.completadas}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow-sm border-primary border-2">
                            <div className="card-body text-center">
                                <Package className="text-primary" size={48} />
                                <h3 className="mt-2">Total del Día</h3>
                                <p className="display-4 fw-bold text-primary mb-0">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pedidos Asignados */}
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

            <WhatsAppButton
                phoneNumber="56912345691"
                message="Hola, necesito soporte con administración"
                text="SOPORTE ADMINISTRACIÓN"
            />

            <footer className="bg-dark text-white text-center py-3 mt-5">
                <p className="mb-0">&copy; 2025 MaxiGas - Panel Repartidor</p>
            </footer>

            {/* Sistema de modales personalizados */}
            <CustomModalComponent />
        </div>
    );
};

export default Repartidor;