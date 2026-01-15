// services/storageService.ts

// services/storageService.ts
import type { User, Product, Order, Category, CartItem } from '../types';

class StorageService {
    // ============================================
    // USUARIOS
    // ============================================

    static getUsers(): User[] {
        return JSON.parse(localStorage.getItem('usuarios') || '[]');
    }

    static setUsers(users: User[]): void {
        localStorage.setItem('usuarios', JSON.stringify(users));
    }

    static findUserByEmail(email: string): User | undefined {
        return this.getUsers().find(u => u.email === email);
    }

    static findUserById(id: number): User | undefined {
        return this.getUsers().find(u => u.id === id);
    }

    static findUserByRut(rut: string): User | undefined {
        return this.getUsers().find(u => u.rut === rut);
    }

    static createUser(user: User): void {
        const users = this.getUsers();
        users.push(user);
        this.setUsers(users);
    }

    static updateUser(updatedUser: User): void {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            this.setUsers(users);
        }
    }

    static deleteUser(userId: number): void {
        const users = this.getUsers().filter(u => u.id !== userId);
        this.setUsers(users);
    }

    static getAllUsers(): User[] {
        return this.getUsers();
    }

    static getUsersByRole(role: string): User[] {
        return this.getUsers().filter(u => u.rol === role);
    }

    // ============================================
    // PRODUCTOS
    // ============================================

    static getProducts(): Product[] {
        return JSON.parse(localStorage.getItem('productos') || '[]');
    }

    static setProducts(products: Product[]): void {
        localStorage.setItem('productos', JSON.stringify(products));
    }

    static findProductById(id: number): Product | undefined {
        return this.getProducts().find(p => p.id === id);
    }

    static createProduct(product: Product): void {
        const products = this.getProducts();
        products.push(product);
        this.setProducts(products);
    }

    static updateProduct(updatedProduct: Product): void {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
            products[index] = updatedProduct;
            this.setProducts(products);
        }
    }

    static deleteProduct(productId: number): void {
        const products = this.getProducts().filter(p => p.id !== productId);
        this.setProducts(products);
    }

    // ============================================
    // PEDIDOS
    // ============================================

    static getOrders(): Order[] {
        return JSON.parse(localStorage.getItem('pedidos') || '[]');
    }

    static setOrders(orders: Order[]): void {
        localStorage.setItem('pedidos', JSON.stringify(orders));
    }

    static findOrderById(id: number): Order | undefined {
        return this.getOrders().find(o => o.id === id);
    }

    static findOrderByNumber(numeroSolicitud: string): Order | undefined {
        return this.getOrders().find(o => o.numeroSolicitud === numeroSolicitud);
    }

    static createOrder(order: Order): void {
        const orders = this.getOrders();
        orders.push(order);
        this.setOrders(orders);
    }

    static updateOrder(updatedOrder: Order): void {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
            orders[index] = updatedOrder;
            this.setOrders(orders);
        }
    }

    static getOrdersByClient(clientId: number): Order[] {
        return this.getOrders().filter(o => o.clienteId === clientId);
    }

    static getOrdersByDelivery(repartidorId: number): Order[] {
        return this.getOrders().filter(o => o.repartidorAsignado === repartidorId);
    }

    // ============================================
    // CATEGORÍAS
    // ============================================

    static getCategories(): Category[] {
        return JSON.parse(localStorage.getItem('categorias') || '[]');
    }

    static setCategories(categories: Category[]): void {
        localStorage.setItem('categorias', JSON.stringify(categories));
    }

    static createCategory(category: Category): void {
        const categories = this.getCategories();
        categories.push(category);
        this.setCategories(categories);
    }

    static deleteCategory(categoryId: number): void {
        const categories = this.getCategories().filter(c => c.id !== categoryId);
        this.setCategories(categories);
    }

    // ============================================
    // CARRITO
    // ============================================

    static getCart(userId: number): CartItem[] {
        return JSON.parse(localStorage.getItem(`carrito_${userId}`) || '[]');
    }

    static setCart(userId: number, cart: CartItem[]): void {
        localStorage.setItem(`carrito_${userId}`, JSON.stringify(cart));
    }

    static clearCart(userId: number): void {
        localStorage.removeItem(`carrito_${userId}`);
    }

    // ============================================
    // SESIÓN ACTUAL
    // ============================================

    static getCurrentUser(): User | null {
        const userData = localStorage.getItem('usuarioActual');
        return userData ? JSON.parse(userData) : null;
    }

    static setCurrentUser(user: User): void {
        localStorage.setItem('usuarioActual', JSON.stringify(user));
    }

    static clearCurrentUser(): void {
        localStorage.removeItem('usuarioActual');
    }
}

export default StorageService;