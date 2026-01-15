// App.tsx (CORREGIDO - Todo con modales personalizados)

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useCart } from './hooks/useCart';
import { useCustomModal } from './components/CustomModals';
import type { Product, Order } from './types';
import StorageService from './services/storageService';
import { initializeData } from './services/initData';

// Pages
import Home from './pages/Home';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Repartidor from './pages/Repartidor';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';

type View = 'home' | 'cart' | 'orders' | 'profile' | 'login' | 'register';

const AppContent: React.FC = () => {
  const { currentUser, isAdmin, isRepartidor } = useAuth();
  const [view, setView] = useState<View>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Sistema de modales personalizados
  const {
    CustomModalComponent,
    alerta,
    exito,
    error,
    advertencia
  } = useCustomModal();

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getItemCount } = useCart(currentUser?.id || null);

  useEffect(() => {
    initializeData();
    loadProducts();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserOrders();
    }
  }, [currentUser]);

  useEffect(() => {
    if (view === 'login') {
      setShowLoginModal(true);
      setView('home');
    } else if (view === 'register') {
      setShowRegisterModal(true);
      setView('home');
    }
  }, [view]);

  const loadProducts = () => {
    const allProducts = StorageService.getProducts();
    setProducts(allProducts);
  };

  const loadUserOrders = () => {
    if (currentUser) {
      const orders = StorageService.getOrdersByClient(currentUser.id);
      setUserOrders(orders);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!currentUser) {
      await error('Debes iniciar sesión para agregar productos al carrito');
      setShowLoginModal(true);
      return;
    }

    const success = addToCart(product);
    if (success) {
      await exito(`${product.nombre} agregado al carrito`);
    } else {
      await error('No hay suficiente stock disponible');
    }
  };

  const handleCheckout = async (orderData: { direccion: string; comuna: string; telefono: string; metodoPago: string }) => {
    if (!currentUser || cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const newOrder: Order = {
      id: Date.now(),
      numeroSolicitud: `PED-${Date.now()}`,
      clienteId: currentUser.id,
      clienteNombre: `${currentUser.nombre} ${currentUser.apellidos}`,
      productos: [...cart],
      direccion: orderData.direccion,
      comuna: orderData.comuna,
      telefono: orderData.telefono,
      metodoPago: orderData.metodoPago,
      subtotal,
      envio: 2990,
      total: subtotal + 2990,
      estado: 'Pendiente',
      fecha: new Date().toISOString()
    };

    StorageService.createOrder(newOrder);

    // Actualizar stock
    const allProducts = StorageService.getProducts();
    cart.forEach(item => {
      const product = allProducts.find(p => p.id === item.id);
      if (product) {
        product.stock -= item.cantidad;
        StorageService.updateProduct(product);
      }
    });

    clearCart();
    loadProducts();
    loadUserOrders();
    await exito(`¡Pedido realizado con éxito!<br><strong>N° ${newOrder.numeroSolicitud}</strong>`);
    setView('home');
  };

  const handleLoginSuccess = async () => {
    loadUserOrders();
    if (currentUser) {
      await exito(`¡Bienvenido ${currentUser.nombre}!`);
    }
  };

  const handleLoginError = async (message: string) => {
    await error(message);
  };

  const handleRegisterSuccess = async () => {
    loadUserOrders();
    await exito('¡Registro exitoso! Bienvenido a MaxiGas');
  };

  const handleRegisterError = async (message: string) => {
    await error(message);
  };

  // Si es admin, mostrar panel de admin
  if (isAdmin) {
    return (
      <>
        <AdminDashboard />
        <CustomModalComponent />
      </>
    );
  }

  // Si es repartidor, mostrar panel de repartidor
  if (isRepartidor) {
    return (
      <>
        <Repartidor />
        <CustomModalComponent />
      </>
    );
  }

  // Vista de cliente
  return (
    <div className="min-vh-100 bg-light">
      <Navbar
        cartCount={getItemCount()}
        onNavigate={(newView) => setView(newView as View)}
      />

      <main>
        {view === 'home' && (
          <Home onAddToCart={handleAddToCart} />
        )}

        {view === 'cart' && (
          <Cart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
            onBack={() => setView('home')}
          />
        )}

        {view === 'orders' && (
          <Orders
            orders={userOrders}
            onBack={() => setView('home')}
          />
        )}
      </main>

      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3">
              <h5 className="text-warning">MAXIGAS</h5>
              <p>Tu proveedor de confianza de gas a domicilio en Chile</p>
            </div>
            <div className="col-md-4 mb-3">
              <h5 className="text-warning">Contacto</h5>
              <p className="mb-1">📞 600 600 1234</p>
              <p className="mb-1">✉️ contacto@maxigas.cl</p>
              <p>📍 Santiago, Chile</p>
            </div>
            <div className="col-md-4">
              <h5 className="text-warning">Síguenos</h5>
              <div className="d-flex gap-3">
                <a href="https://facebook.com" className="text-white fs-4">📘</a>
                <a href="https://instagram.com" className="text-white fs-4">📷</a>
                <a href="https://twitter.com" className="text-white fs-4">🐦</a>
              </div>
            </div>
          </div>
          <hr className="bg-white" />
          <p className="text-center mb-0">&copy; 2025 MaxiGas - Todos los derechos reservados</p>
        </div>
      </footer>

      {/* Modales */}
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />

      <RegisterModal
        show={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
        onError={handleRegisterError}
      />

      {/* Sistema de modales personalizados */}
      <CustomModalComponent />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;