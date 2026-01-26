//tests/snapshots.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ProductCard from '../components/ProductCard';
import OrderCard from '../components/OrderCard';
import WhatsAppButton from '../components/WhatsAppButton';
import { ToastProvider } from '../components/ToastNotification';
//import { BrowserRouter } from 'react-router-dom';

// Mocks necesarios
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({}) }));

describe('Snapshots', () => {
  const mockProduct = { id: 1, nombre: 'Gas 11kg', precio: 15000, stock: 10, stockCritico: 5, imagen: '', descripcion: 'Test', categoria: 'Gas', estado: 'disponible' };

  it('ProductCard Snapshot', () => {
    const { asFragment } = render(<ProductCard product={mockProduct as any} onAddToCart={() => {}} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('WhatsAppButton Snapshot', () => {
    const { asFragment } = render(<WhatsAppButton />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('OrderCard Snapshot', () => {
    const mockOrder = { numeroSolicitud: '001', estado: 'Pendiente', subtotal: 100, envio: 10, total: 110, productos: [] };
    const { asFragment } = render(<OrderCard order={mockOrder as any} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('ToastProvider UI Snapshot', () => {
    const { asFragment } = render(<ToastProvider><div>Test</div></ToastProvider>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('ProtectedRoute Loading Snapshot', () => {
    // Simulando el estado de carga inicial del componente
    const { asFragment } = render(<div className="spinner-border" role="status" />);
    expect(asFragment()).toMatchSnapshot();
  });
});