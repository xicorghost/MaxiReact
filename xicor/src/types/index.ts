// types/index.ts

export type UserRole = 'cliente' | 'repartidor' | 'admin';

export interface User {
    id: number;
    nombre: string;
    apellidos: string;
    rut: string;
    fechaNacimiento: string;
    email: string;
    password: string;
    telefono?: string;
    direccion?: string;
    comuna?: string;
    fechaRegistro: string;
    rol: UserRole;
    foto?: string;
    disponible?: boolean; // Solo para repartidores
}

export interface Product {
    id: number;
    nombre: string;
    categoria: string;
    descripcion: string;
    precio: number;
    stock: number;
    stockCritico: number;
    imagen: string;
    estado: 'disponible' | 'agotado';
}

export interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
    cantidad: number;
}

export type OrderStatus = 'Pendiente' | 'Asignado' | 'En Ruta' | 'Entregado' | 'Cancelado';

export interface Order {
    id: number;
    numeroSolicitud: string;
    clienteId: number;
    clienteNombre: string;
    productos: CartItem[];
    direccion: string;
    comuna: string;
    telefono: string;
    metodoPago: string;
    subtotal: number;
    envio: number;
    total: number;
    estado: OrderStatus;
    fecha: string;
    repartidorAsignado?: number;
    repartidorNombre?: string;
    fechaAsignacion?: string;
    horaInicioRuta?: string;
    horaEntrega?: string;
    fechaCancelacion?: string;
}

export interface Category {
    id: number;
    nombre: string;
    descripcion: string;
    productos: number;
}

export interface DashboardStats {
    pedidosHoy: number;
    totalUsuarios: number;
    repartidoresActivos: number;
    ingresosHoy: number;
}

export interface ReportData {
    ventasSemana: number;
    ventasMes: number;
    pedidosMes: number;
    clientesMes: number;
}