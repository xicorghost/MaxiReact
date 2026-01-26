//tests/components.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
// 1. Importaciones explícitas para solucionar errores de describe, it, expect
import { describe, it, expect, vi } from 'vitest';
// 2. Importamos los componentes que faltaban
import ProductCard from '../components/ProductCard';
import OrderCard from '../components/OrderCard';
import WhatsAppButton from '../components/WhatsAppButton';
import React from 'react';

describe('Interacciones de Componentes', () => {
  it('ProductCard: debe llamar a la función onAddToCart al hacer click', () => {
    const onAdd = vi.fn();
    const product = { id: 1, stock: 5, precio: 100, nombre: 'Gas', stockCritico: 2 } as any;
    render(<ProductCard product={product} onAddToCart={onAdd} />);

    fireEvent.click(screen.getByText(/Agregar al Carrito/i));
    expect(onAdd).toHaveBeenCalled();
  });

  it('ProductCard: debe mostrar "Agotado" si el stock es 0', () => {
    render(<ProductCard product={{ stock: 0, precio: 100 } as any} onAddToCart={vi.fn()} />);

    // En lugar de getByText, buscamos el botón que tiene el texto Agotado
    const botonAgotado = screen.getByRole('button', { name: /Agotado/i });
    expect(botonAgotado).toBeInTheDocument();
    expect(botonAgotado).toBeDisabled();
  });

  it('WhatsAppButton: debe intentar abrir una ventana al hacer clic', () => {
    const spy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<WhatsAppButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(spy).toHaveBeenCalled();
  });

  it('OrderCard: debe mostrar la clase bg-success para estado Entregado', () => {
    const order = { estado: 'Entregado', numeroSolicitud: '001', subtotal: 0, envio: 0, total: 0, productos: [] } as any;
    render(<OrderCard order={order} />);
    expect(screen.getByText('Entregado')).toHaveClass('bg-success');
  });

  it('OrderCard: debe mostrar el número de solicitud correcto', () => {
    const order = { estado: 'Pendiente', numeroSolicitud: '999', subtotal: 0, envio: 0, total: 0, productos: [] } as any;
    render(<OrderCard order={order} />);
    expect(screen.getByText(/Pedido 999/i)).toBeInTheDocument();
  });
});