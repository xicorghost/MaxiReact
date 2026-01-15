// hooks/useCart.ts

import { useState, useEffect } from 'react';
import type { CartItem, Product } from '../types';
import StorageService from '../services/storageService';

interface UseCartReturn {
    cart: CartItem[];
    addToCart: (product: Product) => boolean;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, change: number) => boolean;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
    isInCart: (productId: number) => boolean;
    getItemQuantity: (productId: number) => number;
}

export const useCart = (userId: number | null): UseCartReturn => {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        if (userId) {
            const savedCart = StorageService.getCart(userId);
            setCart(savedCart);
        } else {
            setCart([]);
        }
    }, [userId]);

    const addToCart = (product: Product): boolean => {
        if (!userId) return false;

        const newCart = [...cart];
        const existingItem = newCart.find(item => item.id === product.id);

        if (existingItem) {
            if (existingItem.cantidad < product.stock) {
                existingItem.cantidad++;
            } else {
                return false; // No hay suficiente stock
            }
        } else {
            newCart.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagen,
                cantidad: 1
            });
        }

        setCart(newCart);
        StorageService.setCart(userId, newCart);
        return true;
    };

    const removeFromCart = (productId: number): void => {
        if (!userId) return;

        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        StorageService.setCart(userId, newCart);
    };

    const updateQuantity = (productId: number, change: number): boolean => {
        if (!userId) return false;

        const newCart = [...cart];
        const item = newCart.find(i => i.id === productId);

        if (!item) return false;

        const newQuantity = item.cantidad + change;

        if (newQuantity <= 0) {
            removeFromCart(productId);
            return true;
        }

        // Verificar stock disponible
        const product = StorageService.findProductById(productId);
        if (product && newQuantity > product.stock) {
            return false; // No hay suficiente stock
        }

        item.cantidad = newQuantity;
        setCart(newCart);
        StorageService.setCart(userId, newCart);
        return true;
    };

    const clearCart = (): void => {
        if (!userId) return;

        setCart([]);
        StorageService.clearCart(userId);
    };

    const getTotal = (): number => {
        return cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    };

    const getItemCount = (): number => {
        return cart.reduce((sum, item) => sum + item.cantidad, 0);
    };

    const isInCart = (productId: number): boolean => {
        return cart.some(item => item.id === productId);
    };

    const getItemQuantity = (productId: number): number => {
        const item = cart.find(i => i.id === productId);
        return item ? item.cantidad : 0;
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        isInCart,
        getItemQuantity
    };
};