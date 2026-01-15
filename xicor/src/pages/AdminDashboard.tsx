// pages/AdminDashboard.tsx (ACTUALIZADO CON CRUD DE PRODUCTOS)

import React, { useState, useEffect } from 'react';
import {
    BarChart3, ShoppingCart, Users, Truck, DollarSign,
    Package, Tag, User, FileText, Home, LogOut, Edit, Trash2, Plus
} from 'lucide-react';
import type { Order, Product, User as UserType, Category, DashboardStats } from '../types';
import StorageService from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { useCustomModal } from '../components/CustomModals';
import { ProductModal, AddStockModal } from '../components/ProductModals';

type AdminSection = 'dashboard' | 'ordenes' | 'productos' | 'categorias' | 'usuarios' | 'reportes' | 'perfil';

const AdminDashboard: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
    const [stats, setStats] = useState<DashboardStats>({
        pedidosHoy: 0,
        totalUsuarios: 0,
        repartidoresActivos: 0,
        ingresosHoy: 0
    });
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filtroOrden, setFiltroOrden] = useState<string>('Todos');

    // Estados para modales de productos
    const [showProductModal, setShowProductModal] = useState(false);
    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');

    // Sistema de modales personalizados
    const {
        CustomModalComponent,
        exito,
        error,
        confirmar,
        preguntar
    } = useCustomModal();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setOrders(StorageService.getOrders());
        setProducts(StorageService.getProducts());
        setUsers(StorageService.getAllUsers());
        setCategories(StorageService.getCategories());
        calculateStats();
    };

    const calculateStats = () => {
        const allOrders = StorageService.getOrders();
        const allUsers = StorageService.getAllUsers();
        const today = new Date().toDateString();

        const pedidosHoy = allOrders.filter(o => new Date(o.fecha).toDateString() === today).length;
        const totalUsuarios = allUsers.filter(u => u.rol === 'cliente').length;
        const repartidoresActivos = allUsers.filter(u => u.rol === 'repartidor').length;
        const ingresosHoy = allOrders
            .filter(o => new Date(o.fecha).toDateString() === today && o.estado === 'Entregado')
            .reduce((sum, o) => sum + o.total, 0);

        setStats({ pedidosHoy, totalUsuarios, repartidoresActivos, ingresosHoy });
    };

    const handleLogout = async () => {
        const confirmado = await confirmar('¿Estás seguro que deseas cerrar sesión?');
        if (confirmado) {
            logout();
            window.location.href = '/';
        }
    };

    // ============================================
    // CRUD DE PRODUCTOS
    // ============================================

    const handleCreateProduct = () => {
        setSelectedProduct(null);
        setProductModalMode('create');
        setShowProductModal(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setProductModalMode('edit');
        setShowProductModal(true);
    };

    const handleSaveProduct = async (productData: Omit<Product, 'id'> | Product) => {
        try {
            if ('id' in productData) {
                // Editar producto existente
                StorageService.updateProduct(productData as Product);
                await exito('Producto actualizado correctamente');
            } else {
                // Crear nuevo producto
                const newProduct: Product = {
                    ...productData,
                    id: Date.now()
                };
                StorageService.createProduct(newProduct);
                await exito(`Producto "${newProduct.nombre}" creado correctamente`);
            }

            loadData();
            setShowProductModal(false);
            setSelectedProduct(null);
        } catch (err) {
            await error('Ocurrió un error al guardar el producto');
        }
    };

    const handleDeleteProduct = async (product: Product) => {
        const confirmado = await confirmar(
            `¿Estás seguro que deseas eliminar el producto <strong>"${product.nombre}"</strong>?<br><br>Esta acción no se puede deshacer.`,
            'Confirmar Eliminación'
        );

        if (confirmado) {
            StorageService.deleteProduct(product.id);
            await exito(`Producto "${product.nombre}" eliminado correctamente`);
            loadData();
        }
    };

    const handleOpenAddStock = (product: Product) => {
        setSelectedProduct(product);
        setShowAddStockModal(true);
    };

    const handleAddStock = async (productId: number, cantidad: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            product.stock += cantidad;
            StorageService.updateProduct(product);
            await exito(`Se agregaron ${cantidad} unidades al stock de "${product.nombre}"`);
            loadData();
            setShowAddStockModal(false);
            setSelectedProduct(null);
        }
    };

    // ============================================
    // GESTIÓN DE ÓRDENES
    // ============================================

    const handleAsignarRepartidor = async (pedidoId: number, repartidorId: number) => {
        const allOrders = StorageService.getOrders();
        const orderIndex = allOrders.findIndex(o => o.id === pedidoId);
        const repartidor = users.find(u => u.id === repartidorId);

        if (orderIndex !== -1 && repartidor) {
            allOrders[orderIndex].repartidorAsignado = repartidorId;
            allOrders[orderIndex].repartidorNombre = `${repartidor.nombre} ${repartidor.apellidos}`;
            allOrders[orderIndex].estado = 'Asignado';
            allOrders[orderIndex].fechaAsignacion = new Date().toISOString();

            StorageService.setOrders(allOrders);
            loadData();
            await exito(`Pedido asignado a ${repartidor.nombre}`);
        }
    };

    const handleCancelarPedido = async (numeroSolicitud: string) => {
        const confirmado = await confirmar('¿Estás seguro que deseas cancelar este pedido?');
        if (!confirmado) return;

        const allOrders = StorageService.getOrders();
        const orderIndex = allOrders.findIndex(o => o.numeroSolicitud === numeroSolicitud);

        if (orderIndex !== -1 && allOrders[orderIndex].estado === 'Pendiente') {
            allOrders[orderIndex].estado = 'Cancelado';
            allOrders[orderIndex].fechaCancelacion = new Date().toISOString();

            // Devolver stock
            const allProducts = StorageService.getProducts();
            allOrders[orderIndex].productos.forEach(item => {
                const productIndex = allProducts.findIndex(p => p.id === item.id);
                if (productIndex !== -1) {
                    allProducts[productIndex].stock += item.cantidad;
                }
            });

            StorageService.setProducts(allProducts);
            StorageService.setOrders(allOrders);
            loadData();
            await exito('Pedido cancelado y stock devuelto');
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
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <aside className="bg-dark text-white" style={{ width: '250px' }}>
                <div className="p-4">
                    <h4 className="text-danger">🔥 MAXIGAS</h4>
                    <p className="small mb-0">Administración</p>
                </div>
                <nav className="nav flex-column">
                    <a
                        className={`nav-link text-white ${activeSection === 'dashboard' ? 'bg-danger' : ''}`}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveSection('dashboard'); }}
                    >
                        <Home size={18} className="me-2" />
                        Dashboard
                    </a>
                    <a
                        className={`nav-link text-white ${activeSection === 'ordenes' ? 'bg-danger' : ''}`}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveSection('ordenes'); }}
                    >
                        <ShoppingCart size={18} className="me-2" />
                        Órdenes
                    </a>
                    <a
                        className={`nav-link text-white ${activeSection === 'productos' ? 'bg-danger' : ''}`}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveSection('productos'); }}
                    >
                        <Package size={18} className="me-2" />
                        Productos
                    </a>
                    <a
                        className={`nav-link text-white ${activeSection === 'categorias' ? 'bg-danger' : ''}`}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveSection('categorias'); }}
                    >
                        <Tag size={18} className="me-2" />
                        Categorías
                    </a>
                    <a
                        className={`nav-link text-white ${activeSection === 'usuarios' ? 'bg-danger' : ''}`}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveSection('usuarios'); }}
                    >
                        <Users size={18} className="me-2" />
                        Usuarios
                    </a>
                    <a
                        className={`nav-link text-white ${activeSection === 'reportes' ? 'bg-danger' : ''}`}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveSection('reportes'); }}
                    >
                        <BarChart3 size={18} className="me-2" />
                        Reportes
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-grow-1">
                {/* Header */}
                <header className="bg-white shadow-sm p-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Panel Administrativo</h5>
                        <div className="d-flex align-items-center gap-3">
                            <span>{currentUser.nombre} {currentUser.apellidos}</span>
                            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                                <LogOut size={16} className="me-1" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="p-4 bg-light" style={{ minHeight: 'calc(100vh - 60px)' }}>
                    {/* DASHBOARD */}
                    {activeSection === 'dashboard' && (
                        <div>
                            <h2 className="mb-4">Dashboard General</h2>
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

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card shadow-sm">
                                        <div className="card-header bg-danger text-white">
                                            <h5 className="mb-0">Pedidos Recientes</h5>
                                        </div>
                                        <div className="card-body">
                                            {orders.slice(-5).reverse().map(order => (
                                                <div key={order.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                                    <div>
                                                        <strong>{order.numeroSolicitud}</strong><br />
                                                        <small className="text-muted">{order.clienteNombre}</small>
                                                    </div>
                                                    <span className={`badge ${getBadgeClass(order.estado)}`}>
                                                        {order.estado}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card shadow-sm">
                                        <div className="card-header bg-danger text-white">
                                            <h5 className="mb-0">Productos Stock Bajo</h5>
                                        </div>
                                        <div className="card-body">
                                            {products.filter(p => p.stock <= p.stockCritico).length === 0 ? (
                                                <p className="text-success">Todos los productos tienen stock suficiente</p>
                                            ) : (
                                                products.filter(p => p.stock <= p.stockCritico).map(product => (
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
                    )}

                    {/* ÓRDENES */}
                    {activeSection === 'ordenes' && (
                        <div>
                            <h2 className="mb-4">Gestión de Órdenes</h2>
                            <div className="mb-3">
                                <button className="btn btn-sm btn-outline-danger me-2" onClick={() => setFiltroOrden('Todos')}>Todos</button>
                                <button className="btn btn-sm btn-outline-warning me-2" onClick={() => setFiltroOrden('Pendiente')}>Pendientes</button>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setFiltroOrden('En Ruta')}>En Ruta</button>
                                <button className="btn btn-sm btn-outline-success" onClick={() => setFiltroOrden('Entregado')}>Entregados</button>
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
                                        {orders
                                            .filter(o => filtroOrden === 'Todos' || o.estado === filtroOrden)
                                            .reverse()
                                            .map(order => (
                                                <tr key={order.id}>
                                                    <td><strong>{order.numeroSolicitud}</strong></td>
                                                    <td>{order.clienteNombre}</td>
                                                    <td>
                                                        <small>{order.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', ')}</small>
                                                    </td>
                                                    <td className="fw-bold text-primary">${order.total.toLocaleString('es-CL')}</td>
                                                    <td>
                                                        <span className={`badge ${getBadgeClass(order.estado)}`}>
                                                            {order.estado}
                                                        </span>
                                                    </td>
                                                    <td><small>{new Date(order.fecha).toLocaleDateString('es-CL')}</small></td>
                                                    <td>
                                                        {order.estado === 'Pendiente' && (
                                                            <>
                                                                <select
                                                                    className="form-select form-select-sm mb-1"
                                                                    onChange={(e) => {
                                                                        if (e.target.value) {
                                                                            handleAsignarRepartidor(order.id, parseInt(e.target.value));
                                                                        }
                                                                    }}
                                                                >
                                                                    <option value="">Asignar...</option>
                                                                    {users.filter(u => u.rol === 'repartidor').map(r => (
                                                                        <option key={r.id} value={r.id}>
                                                                            {r.nombre} {r.apellidos}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleCancelarPedido(order.numeroSolicitud)}
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* PRODUCTOS */}
                    {activeSection === 'productos' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h2 className="mb-0">Gestión de Productos</h2>
                                <button className="btn btn-danger" onClick={handleCreateProduct}>
                                    <Plus size={18} className="me-2" />
                                    Agregar Producto
                                </button>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover bg-white">
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Nombre</th>
                                            <th>Categoría</th>
                                            <th>Precio</th>
                                            <th>Stock</th>
                                            <th>Stock Crítico</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    <img src={product.imagen} alt={product.nombre} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                                                </td>
                                                <td><strong>{product.nombre}</strong></td>
                                                <td>{product.categoria}</td>
                                                <td className="fw-bold text-primary">${product.precio.toLocaleString('es-CL')}</td>
                                                <td>{product.stock}</td>
                                                <td className="text-danger">{product.stockCritico}</td>
                                                <td>
                                                    {product.stock > product.stockCritico ? (
                                                        <span className="badge bg-success">Disponible</span>
                                                    ) : product.stock > 0 ? (
                                                        <span className="badge bg-warning text-dark">Stock Bajo</span>
                                                    ) : (
                                                        <span className="badge bg-danger">Agotado</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        onClick={() => handleEditProduct(product)}
                                                        title="Editar"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-success me-1"
                                                        onClick={() => handleOpenAddStock(product)}
                                                        title="Agregar Stock"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteProduct(product)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* CATEGORÍAS */}
                    {activeSection === 'categorias' && (
                        <div>
                            <h2 className="mb-4">Gestión de Categorías</h2>
                            <button className="btn btn-danger mb-3">
                                <Tag size={18} className="me-2" />
                                Agregar Categoría
                            </button>
                            <div className="row">
                                {categories.map(cat => (
                                    <div key={cat.id} className="col-md-4 mb-3">
                                        <div className="card shadow-sm">
                                            <div className="card-body">
                                                <h5 className="text-danger">
                                                    <Tag size={20} className="me-2" />
                                                    {cat.nombre}
                                                </h5>
                                                <p className="text-muted">{cat.descripcion}</p>
                                                <p className="mb-0">
                                                    <strong>{products.filter(p => p.categoria === cat.nombre).length}</strong> productos
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* USUARIOS */}
                    {activeSection === 'usuarios' && (
                        <div>
                            <h2 className="mb-4">Gestión de Usuarios</h2>
                            <button className="btn btn-danger mb-3">
                                <User size={18} className="me-2" />
                                Registrar Usuario
                            </button>
                            <div className="table-responsive">
                                <table className="table table-hover bg-white">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>RUT</th>
                                            <th>Nombre</th>
                                            <th>Email</th>
                                            <th>Teléfono</th>
                                            <th>Tipo</th>
                                            <th>Fecha Registro</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td><strong>#{user.id}</strong></td>
                                                <td>{user.rut}</td>
                                                <td>{user.nombre} {user.apellidos}</td>
                                                <td>{user.email}</td>
                                                <td>{user.telefono || 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${user.rol === 'admin' ? 'bg-danger' :
                                                            user.rol === 'repartidor' ? 'bg-primary' :
                                                                'bg-success'
                                                        }`}>
                                                        {user.rol.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>{new Date(user.fechaRegistro).toLocaleDateString('es-CL')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* REPORTES */}
                    {activeSection === 'reportes' && (
                        <div>
                            <h2 className="mb-4">Reportes y Estadísticas</h2>
                            <div className="card shadow-sm">
                                <div className="card-header bg-danger text-white">
                                    <h5 className="mb-0">Resumen de Ventas</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row text-center">
                                        <div className="col-md-3">
                                            <h3 className="text-primary">$0</h3>
                                            <p>Ventas Semana</p>
                                        </div>
                                        <div className="col-md-3">
                                            <h3 className="text-success">$0</h3>
                                            <p>Ventas Mes</p>
                                        </div>
                                        <div className="col-md-3">
                                            <h3 className="text-warning">{orders.length}</h3>
                                            <p>Total Pedidos</p>
                                        </div>
                                        <div className="col-md-3">
                                            <h3 className="text-info">{users.filter(u => u.rol === 'cliente').length}</h3>
                                            <p>Clientes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modales de Productos */}
            <ProductModal
                show={showProductModal}
                product={selectedProduct}
                categories={categories}
                onClose={() => {
                    setShowProductModal(false);
                    setSelectedProduct(null);
                }}
                onSave={handleSaveProduct}
                mode={productModalMode}
            />

            <AddStockModal
                show={showAddStockModal}
                product={selectedProduct}
                onClose={() => {
                    setShowAddStockModal(false);
                    setSelectedProduct(null);
                }}
                onSave={handleAddStock}
            />

            {/* Sistema de modales personalizados */}
            <CustomModalComponent />
        </div>
    );
};

export default AdminDashboard;