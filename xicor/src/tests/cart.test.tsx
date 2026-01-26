import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types';

const mockProduct: Product = {
    id: 1,
    nombre: 'Gas 11kg',
    precio: 15000,
    stock: 10,
    stockCritico: 2,
    categoria: 'Gas',
    descripcion: 'Test',
    imagen: '',
    estado: 'disponible'
};

describe('Hook useCart (Integración)', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('debe iniciar con un carrito vacío', () => {
        const { result } = renderHook(() => useCart(999));
        expect(result.current.cart).toEqual([]);
        expect(result.current.getTotal()).toBe(0);
    });

    it('debe agregar un producto y calcular el total', () => {
        const { result } = renderHook(() => useCart(999));

        act(() => {
            result.current.addToCart(mockProduct);
        });

        expect(result.current.cart.length).toBe(1);
        expect(result.current.cart[0].cantidad).toBe(1);
        expect(result.current.getTotal()).toBe(15000);
    });

    it('debe aumentar cantidad si el producto ya existe', () => {
        const { result } = renderHook(() => useCart(999));

        // Primera inserción
        act(() => {
            result.current.addToCart(mockProduct);
        });

        // Segunda inserción (ahora el estado ya tiene el primer item)
        act(() => {
            result.current.addToCart(mockProduct);
        });

        expect(result.current.cart[0].cantidad).toBe(2);
        expect(result.current.getTotal()).toBe(30000);
    });

    it('debe limpiar el carrito correctamente', () => {
        const { result } = renderHook(() => useCart(999));

        act(() => {
            result.current.addToCart(mockProduct);
            result.current.clearCart();
        });

        expect(result.current.cart).toEqual([]);
    });
});