// services/initData.ts

import type { User, Product, Category } from '../types';
import StorageService from './storageService';

// Esto crea un objeto donde la llave es la ruta y el valor es la imagen procesada
const allImages: Record<string, { default: string }> = import.meta.glob('../assets/*.{png,jpg,jpeg,gif}', { eager: true });

// Función de ayuda para obtener la URL real
const getAssetUrl = (name: string) => {
    const path = `../assets/${name}`;
    return allImages[path]?.default || 'https://via.placeholder.com/300';
};

export const initializeData = (): void => {
    // Inicializar usuarios por defecto
    const users = StorageService.getAllUsers();
    if (users.length === 0) {
        const defaultUsers: User[] = [
            {
                id: 9001,
                nombre: 'Administrador',
                apellidos: 'Sistema',
                rut: '11.111.111-1',
                fechaNacimiento: '1990-01-01',
                email: 'admin@maxigas.cl',
                password: 'Admin123',
                telefono: '+56912345678',
                direccion: '',
                comuna: '',
                fechaRegistro: new Date().toISOString(),
                rol: 'admin',
                foto: 'https://via.placeholder.com/150'
            },
            {
                id: 9002,
                nombre: 'Juan',
                apellidos: 'Pérez',
                rut: '22.222.222-2',
                fechaNacimiento: '1995-01-01',
                email: 'repartidor@maxigas.cl',
                password: 'Repartidor123',
                telefono: '+56987654321',
                direccion: '',
                comuna: '',
                fechaRegistro: new Date().toISOString(),
                rol: 'repartidor',
                foto: 'https://via.placeholder.com/150',
                disponible: true
            }
        ];

        defaultUsers.forEach(user => StorageService.createUser(user));
    }

    // Inicializar categorías
    const categories = StorageService.getCategories();
    if (categories.length === 0) {
        const defaultCategories: Category[] = [
            {
                id: 1,
                nombre: 'Gas Licuado',
                descripcion: 'Cilindros de gas para uso doméstico',
                productos: 3
            },
            {
                id: 2,
                nombre: 'Accesorios',
                descripcion: 'Accesorios y repuestos para gas',
                productos: 0
            }
        ];

        defaultCategories.forEach(cat => StorageService.createCategory(cat));
    }

    // Inicializar productos
    const products = StorageService.getProducts();
    if (products.length === 0) {
        const defaultProducts: Product[] = [
            {
                id: 1,
                nombre: 'Cilindro 5 kg',
                categoria: 'Gas Licuado',
                descripcion: 'Ideal para hogares pequeños',
                precio: 8990,
                stock: 50,
                stockCritico: 10,
                imagen: getAssetUrl('adrink1.gif'),
                //imagen: '/assets/adrink1.gif',
                //imagen: 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=5kg',
                estado: 'disponible'
            },
            {
                id: 2,
                nombre: 'Cilindro 11 kg',
                categoria: 'Gas Licuado',
                descripcion: 'El más popular para uso doméstico',
                precio: 16990,
                stock: 100,
                stockCritico: 20,
                imagen: getAssetUrl('11-kg.png'),
                estado: 'disponible'
            },
            {
                id: 3,
                nombre: 'Cilindro 15 kg',
                categoria: 'Gas Licuado',
                descripcion: 'Mayor rendimiento y duración',
                precio: 22990,
                stock: 75,
                stockCritico: 15,
                imagen: getAssetUrl('15-kg.png'),
                estado: 'disponible'
            }
        ];

        defaultProducts.forEach(product => StorageService.createProduct(product));
    }
};