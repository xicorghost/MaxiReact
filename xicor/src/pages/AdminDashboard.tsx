// pages/AdminDashboard.tsx (CON SINCRONIZACIÓN AUTOMÁTICA)

import React, { useState, useEffect } from 'react';
import {
    Home, ShoppingCart, Package, Tag, Users, BarChart3, LogOut
} from 'lucide-react';
import type { Order, Product, User as UserType, Category, DashboardStats } from '../types';
import StorageService from '../services/storageService';
import StorageSyncService from '../services/storageSyncService';
import { useAuth } from '../context/AuthContext';
import { useCustomModal } from '../components/CustomModals';

// Componentes de secciones
import { DashboardSection } from '../components/admin/DashboardSection';
import { OrdersSection } from '../components/admin/OrdersSection';
import { ProductsSection } from '../components/admin/ProductsSection';
import { CategoriesSection } from '../components/admin/CategoriesSection';
import { UsersSection } from '../components/admin/UsersSection';
import { ReportsSection } from '../components/admin/ReportsSection';

type AdminSection = 'dashboard' | 'ordenes' | 'productos' | 'categorias' | 'usuarios' | 'reportes';

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

    const {
        CustomModalComponent,
        exito,
        error,
        confirmar,
        mostrarDetalleUsuario
    } = useCustomModal();

    useEffect(() => {
        loadData();

        // Suscribirse a cambios de sincronización
        const unsubscribe = StorageSyncService.subscribe(() => {
            console.log('🔄 AdminDashboard: Recargando datos desde otra pestaña...');
            loadData();
        });

        return () => unsubscribe();
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
    // HANDLERS DE PRODUCTOS
    // ============================================

    const handleSaveProduct = async (productData: Omit<Product, 'id'> | Product) => {
        try {
            if ('id' in productData) {
                StorageService.updateProduct(productData as Product);
                await exito('Producto actualizado correctamente');
            } else {
                const newProduct: Product = {
                    ...productData,
                    id: Date.now()
                };
                StorageService.createProduct(newProduct);
                await exito(`Producto "${newProduct.nombre}" creado correctamente`);
            }
            loadData();
            StorageSyncService.triggerSync();
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
            StorageSyncService.triggerSync();
        }
    };

    const handleAddStock = async (productId: number, cantidad: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            product.stock += cantidad;
            StorageService.updateProduct(product);
            await exito(`Se agregaron ${cantidad} unidades al stock de "${product.nombre}"`);
            loadData();
            StorageSyncService.triggerSync();
        }
    };

    // ============================================
    // HANDLERS DE CATEGORÍAS
    // ============================================

    const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'productos'> | Category) => {
        try {
            if ('id' in categoryData) {
                const updatedCategory = categoryData as Category;
                const allCategories = StorageService.getCategories();
                const index = allCategories.findIndex(c => c.id === updatedCategory.id);

                if (index !== -1) {
                    const oldName = allCategories[index].nombre;
                    if (oldName !== updatedCategory.nombre) {
                        const allProducts = StorageService.getProducts();
                        allProducts.forEach(p => {
                            if (p.categoria === oldName) {
                                p.categoria = updatedCategory.nombre;
                                StorageService.updateProduct(p);
                            }
                        });
                    }

                    allCategories[index] = updatedCategory;
                    StorageService.setCategories(allCategories);
                    await exito('Categoría actualizada correctamente');
                }
            } else {
                const newCategory: Category = {
                    ...categoryData,
                    id: Date.now(),
                    productos: 0
                };
                StorageService.createCategory(newCategory);
                await exito(`Categoría "${newCategory.nombre}" creada correctamente`);
            }
            loadData();
            StorageSyncService.triggerSync();
        } catch (err) {
            await error('Ocurrió un error al guardar la categoría');
        }
    };

    const handleDeleteCategory = async (category: Category) => {
        const productCount = products.filter(p => p.categoria === category.nombre).length;

        if (productCount > 0) {
            await error(
                `No se puede eliminar la categoría <strong>"${category.nombre}"</strong> porque tiene ${productCount} producto(s) asociado(s).<br><br>Elimina o cambia la categoría de los productos primero.`,
                'No se puede eliminar'
            );
            return;
        }

        const confirmado = await confirmar(
            `¿Estás seguro que deseas eliminar la categoría <strong>"${category.nombre}"</strong>?`,
            'Confirmar Eliminación'
        );

        if (confirmado) {
            StorageService.deleteCategory(category.id);
            await exito(`Categoría "${category.nombre}" eliminada correctamente`);
            loadData();
            StorageSyncService.triggerSync();
        }
    };

    // ============================================
    // HANDLERS DE ÓRDENES
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
            StorageSyncService.triggerSync();
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
            StorageSyncService.triggerSync();
            await exito('Pedido cancelado y stock devuelto');
        }
    };

    // ============================================
    // HANDLERS DE USUARIOS
    // ============================================

    const handleSaveUser = async (userData: Omit<UserType, 'id' | 'fechaRegistro' | 'foto'> | UserType) => {
        try {
            if ('id' in userData) {
                StorageService.updateUser(userData as UserType);
                await exito('Usuario actualizado correctamente');
            } else {
                const existingUserByEmail = StorageService.findUserByEmail(userData.email);
                const existingUserByRut = StorageService.findUserByRut(userData.rut);

                if (existingUserByEmail || existingUserByRut) {
                    await error('Ya existe un usuario con este correo o RUT');
                    return;
                }

                const newUser: UserType = {
                    ...userData,
                    id: Date.now(),
                    fechaRegistro: new Date().toISOString(),
                    foto: 'https://via.placeholder.com/150',
                    disponible: userData.rol === 'repartidor' ? true : undefined
                };
                StorageService.createUser(newUser);
                await exito(`Usuario "${newUser.nombre} ${newUser.apellidos}" registrado correctamente`);
            }
            loadData();
            StorageSyncService.triggerSync();
        } catch (err) {
            await error('Ocurrió un error al guardar el usuario');
        }
    };

    const handleDeleteUser = async (user: UserType) => {
        if (user.rol === 'admin') {
            await error('No se puede eliminar un usuario administrador');
            return;
        }

        const confirmado = await confirmar(
            `¿Estás seguro que deseas eliminar al usuario <strong>"${user.nombre} ${user.apellidos}"</strong>?<br><br>Esta acción no se puede deshacer.`,
            'Confirmar Eliminación'
        );

        if (confirmado) {
            StorageService.deleteUser(user.id);
            await exito(`Usuario "${user.nombre} ${user.apellidos}" eliminado correctamente`);
            loadData();
            StorageSyncService.triggerSync();
        }
    };

    const handleViewUserDetails = async (user: UserType) => {
        await mostrarDetalleUsuario(user);
    };

    if (!currentUser) return null;

    return (
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <aside className="bg-dark text-white" style={{ width: '250px', flexShrink: 0 }}>
                <div className="p-4">
                    <h4 className="text-danger">🔥 MAXIGAS</h4>
                    <p className="small mb-0">Administración</p>
                </div>
                <nav className="nav flex-column">
                    {[
                        { id: 'dashboard', icon: Home, label: 'Dashboard' },
                        { id: 'ordenes', icon: ShoppingCart, label: 'Órdenes' },
                        { id: 'productos', icon: Package, label: 'Productos' },
                        { id: 'categorias', icon: Tag, label: 'Categorías' },
                        { id: 'usuarios', icon: Users, label: 'Usuarios' },
                        { id: 'reportes', icon: BarChart3, label: 'Reportes' }
                    ].map(({ id, icon: Icon, label }) => (
                        <a
                            key={id}
                            className={`nav-link text-white ${activeSection === id ? 'bg-danger' : ''}`}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setActiveSection(id as AdminSection); }}
                        >
                            <Icon size={18} className="me-2" />
                            {label}
                        </a>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column">
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
                <main className="p-4 bg-light flex-grow-1" style={{ overflowY: 'auto' }}>
                    {activeSection === 'dashboard' && (
                        <DashboardSection
                            stats={stats}
                            orders={orders}
                            products={products}
                        />
                    )}

                    {activeSection === 'ordenes' && (
                        <OrdersSection
                            orders={orders}
                            users={users}
                            onAsignarRepartidor={handleAsignarRepartidor}
                            onCancelar={handleCancelarPedido}
                        />
                    )}

                    {activeSection === 'productos' && (
                        <ProductsSection
                            products={products}
                            categories={categories}
                            onSave={handleSaveProduct}
                            onDelete={handleDeleteProduct}
                            onAddStock={handleAddStock}
                        />
                    )}

                    {activeSection === 'categorias' && (
                        <CategoriesSection
                            categories={categories}
                            products={products}
                            onSave={handleSaveCategory}
                            onDelete={handleDeleteCategory}
                        />
                    )}

                    {activeSection === 'usuarios' && (
                        <UsersSection
                            users={users}
                            onSave={handleSaveUser}
                            onDelete={handleDeleteUser}
                            onViewDetails={handleViewUserDetails}
                        />
                    )}

                    {activeSection === 'reportes' && (
                        <ReportsSection
                            orders={orders}
                            products={products}
                            users={users}
                        />
                    )}
                </main>
            </div>

            {/* Sistema de modales personalizados */}
            <CustomModalComponent />
        </div>
    );
};

export default AdminDashboard;