// components/admin/ReportsSection.tsx (CON EXPORTACIÓN EXCEL)

import React, { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Download, 
    Calendar,
    Package,
    Users,
    DollarSign,
    Truck,
    FileSpreadsheet
} from 'lucide-react';
import type { Order, Product, User } from '../../types';

interface ReportsSectionProps {
    orders: Order[];
    products: Product[];
    users: User[];
}

interface SalesData {
    fecha: string;
    ventas: number;
    pedidos: number;
}

interface TopProduct {
    nombre: string;
    cantidad: number;
    ingresos: number;
}

interface RepartidorStats {
    nombre: string;
    entregas: number;
    enRuta: number;
    total: number;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
    orders,
    products,
    users
}) => {
    const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes'>('semana');
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [repartidorStats, setRepartidorStats] = useState<RepartidorStats[]>([]);
    const [generalStats, setGeneralStats] = useState({
        totalVentas: 0,
        totalPedidos: 0,
        ticketPromedio: 0,
        tasaEntrega: 0,
        clientesActivos: 0,
        productosVendidos: 0
    });

    useEffect(() => {
        calculateReports();
    }, [orders, products, users, periodo]);

    const calculateReports = () => {
        calculateSalesData();
        calculateTopProducts();
        calculateRepartidorStats();
        calculateGeneralStats();
    };

    const calculateSalesData = () => {
        const now = new Date();
        const data: SalesData[] = [];
        let days = 7;

        if (periodo === 'dia') days = 1;
        if (periodo === 'mes') days = 30;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('es-CL');

            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.fecha);
                return orderDate.toDateString() === date.toDateString();
            });

            const ventas = dayOrders
                .filter(o => o.estado === 'Entregado')
                .reduce((sum, o) => sum + o.total, 0);

            data.push({
                fecha: dateStr,
                ventas,
                pedidos: dayOrders.length
            });
        }

        setSalesData(data);
    };

    const calculateTopProducts = () => {
        const productSales: { [key: string]: TopProduct } = {};

        orders
            .filter(o => o.estado === 'Entregado')
            .forEach(order => {
                order.productos.forEach(p => {
                    if (!productSales[p.nombre]) {
                        productSales[p.nombre] = {
                            nombre: p.nombre,
                            cantidad: 0,
                            ingresos: 0
                        };
                    }
                    productSales[p.nombre].cantidad += p.cantidad;
                    productSales[p.nombre].ingresos += p.precio * p.cantidad;
                });
            });

        const sorted = Object.values(productSales)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);

        setTopProducts(sorted);
    };

    const calculateRepartidorStats = () => {
        const repartidores = users.filter(u => u.rol === 'repartidor');
        const stats: RepartidorStats[] = repartidores.map(r => {
            const entregas = orders.filter(
                o => o.repartidorAsignado === r.id && o.estado === 'Entregado'
            ).length;

            const enRuta = orders.filter(
                o => o.repartidorAsignado === r.id && o.estado === 'En Ruta'
            ).length;

            return {
                nombre: `${r.nombre} ${r.apellidos}`,
                entregas,
                enRuta,
                total: entregas + enRuta
            };
        });

        setRepartidorStats(stats.sort((a, b) => b.entregas - a.entregas));
    };

    const calculateGeneralStats = () => {
        const totalVentas = orders
            .filter(o => o.estado === 'Entregado')
            .reduce((sum, o) => sum + o.total, 0);

        const totalPedidos = orders.length;
        const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

        const entregados = orders.filter(o => o.estado === 'Entregado').length;
        const tasaEntrega = totalPedidos > 0 ? (entregados / totalPedidos) * 100 : 0;

        const clientesActivos = new Set(orders.map(o => o.clienteId)).size;

        const productosVendidos = orders
            .filter(o => o.estado === 'Entregado')
            .reduce((sum, o) => sum + o.productos.reduce((s, p) => s + p.cantidad, 0), 0);

        setGeneralStats({
            totalVentas,
            totalPedidos,
            ticketPromedio,
            tasaEntrega,
            clientesActivos,
            productosVendidos
        });
    };

    const exportToCSV = () => {
        const csv = [
            ['Fecha', 'Ventas', 'Pedidos'],
            ...salesData.map(d => [d.fecha, d.ventas, d.pedidos])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToExcel = () => {
        // Crear contenido HTML para Excel
        const excelContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>Reporte de Ventas</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #dc3545; color: white; font-weight: bold; }
                    .header { background-color: #f8f9fa; font-weight: bold; padding: 10px; margin-bottom: 20px; }
                    .stats-table { margin-bottom: 30px; }
                    .section-title { background-color: #e9ecef; font-weight: bold; padding: 8px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>MAXIGAS - Reporte de Ventas</h1>
                    <p>Fecha de generación: ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString('es-CL')}</p>
                    <p>Período: ${periodo === 'dia' ? 'Hoy' : periodo === 'semana' ? 'Última Semana' : 'Último Mes'}</p>
                </div>

                <h2>Estadísticas Generales</h2>
                <table class="stats-table">
                    <tr>
                        <th>Métrica</th>
                        <th>Valor</th>
                    </tr>
                    <tr>
                        <td>Ventas Totales</td>
                        <td>$${generalStats.totalVentas.toLocaleString('es-CL')}</td>
                    </tr>
                    <tr>
                        <td>Total de Pedidos</td>
                        <td>${generalStats.totalPedidos}</td>
                    </tr>
                    <tr>
                        <td>Ticket Promedio</td>
                        <td>$${generalStats.ticketPromedio.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr>
                        <td>Tasa de Entrega</td>
                        <td>${generalStats.tasaEntrega.toFixed(1)}%</td>
                    </tr>
                    <tr>
                        <td>Clientes Activos</td>
                        <td>${generalStats.clientesActivos}</td>
                    </tr>
                    <tr>
                        <td>Productos Vendidos</td>
                        <td>${generalStats.productosVendidos}</td>
                    </tr>
                </table>

                <h2>Evolución de Ventas por Día</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Ventas ($)</th>
                            <th>Cantidad de Pedidos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${salesData.map(d => `
                            <tr>
                                <td>${d.fecha}</td>
                                <td>$${d.ventas.toLocaleString('es-CL')}</td>
                                <td>${d.pedidos}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h2 class="section-title">Top 5 Productos Más Vendidos</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Posición</th>
                            <th>Producto</th>
                            <th>Unidades Vendidas</th>
                            <th>Ingresos ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topProducts.map((p, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${p.nombre}</td>
                                <td>${p.cantidad}</td>
                                <td>$${p.ingresos.toLocaleString('es-CL')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h2 class="section-title">Rendimiento de Repartidores</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Repartidor</th>
                            <th>Entregas Completadas</th>
                            <th>En Ruta</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${repartidorStats.map(r => `
                            <tr>
                                <td>${r.nombre}</td>
                                <td>${r.entregas}</td>
                                <td>${r.enRuta}</td>
                                <td>${r.total}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([excelContent], { 
            type: 'application/vnd.ms-excel;charset=utf-8' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.xls`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const maxVentas = Math.max(...salesData.map(d => d.ventas), 1);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                    <BarChart3 className="me-2" size={32} />
                    Reportes y Estadísticas
                </h2>
                <div className="btn-group">
                    <button className="btn btn-success" onClick={exportToCSV}>
                        <Download size={18} className="me-2" />
                        Exportar CSV
                    </button>
                    <button className="btn btn-primary" onClick={exportToExcel}>
                        <FileSpreadsheet size={18} className="me-2" />
                        Exportar Excel
                    </button>
                </div>
            </div>

            {/* Estadísticas Generales */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card shadow-sm border-success">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Ventas Totales</h6>
                                    <h3 className="text-success mb-0">
                                        ${generalStats.totalVentas.toLocaleString('es-CL')}
                                    </h3>
                                </div>
                                <DollarSign size={48} className="text-success" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-primary">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Total Pedidos</h6>
                                    <h3 className="text-primary mb-0">{generalStats.totalPedidos}</h3>
                                </div>
                                <Package size={48} className="text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-info">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Ticket Promedio</h6>
                                    <h3 className="text-info mb-0">
                                        ${generalStats.ticketPromedio.toLocaleString('es-CL', {
                                            maximumFractionDigits: 0
                                        })}
                                    </h3>
                                </div>
                                <TrendingUp size={48} className="text-info" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-warning">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Tasa de Entrega</h6>
                                    <h3 className="text-warning mb-0">
                                        {generalStats.tasaEntrega.toFixed(1)}%
                                    </h3>
                                </div>
                                <Truck size={48} className="text-warning" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-success">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Clientes Activos</h6>
                                    <h3 className="text-success mb-0">{generalStats.clientesActivos}</h3>
                                </div>
                                <Users size={48} className="text-success" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card shadow-sm border-danger">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Productos Vendidos</h6>
                                    <h3 className="text-danger mb-0">{generalStats.productosVendidos}</h3>
                                </div>
                                <Package size={48} className="text-danger" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de Ventas */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-danger text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <Calendar className="me-2" size={20} />
                            Evolución de Ventas
                        </h5>
                        <div className="btn-group btn-group-sm">
                            <button
                                className={`btn ${periodo === 'dia' ? 'btn-light' : 'btn-outline-light'}`}
                                onClick={() => setPeriodo('dia')}
                            >
                                Hoy
                            </button>
                            <button
                                className={`btn ${periodo === 'semana' ? 'btn-light' : 'btn-outline-light'}`}
                                onClick={() => setPeriodo('semana')}
                            >
                                Semana
                            </button>
                            <button
                                className={`btn ${periodo === 'mes' ? 'btn-light' : 'btn-outline-light'}`}
                                onClick={() => setPeriodo('mes')}
                            >
                                Mes
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        {salesData.map((data, index) => (
                            <div
                                key={index}
                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                <div className="text-center mb-2">
                                    <small className="text-success fw-bold">
                                        ${(data.ventas / 1000).toFixed(0)}k
                                    </small>
                                    <br />
                                    <small className="text-muted">({data.pedidos})</small>
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: `${(data.ventas / maxVentas) * 200}px`,
                                        backgroundColor: '#dc3545',
                                        borderRadius: '4px 4px 0 0',
                                        minHeight: '5px',
                                        transition: 'height 0.3s ease'
                                    }}
                                    title={`$${data.ventas.toLocaleString('es-CL')}`}
                                />
                                <small className="text-muted mt-2" style={{ fontSize: '10px' }}>
                                    {data.fecha.split('/').slice(0, 2).join('/')}
                                </small>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Top Productos */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                <Package className="me-2" size={20} />
                                Top 5 Productos Más Vendidos
                            </h5>
                        </div>
                        <div className="card-body">
                            {topProducts.length === 0 ? (
                                <p className="text-muted text-center">No hay datos de productos vendidos</p>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {topProducts.map((product, index) => (
                                        <div
                                            key={index}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <span className="badge bg-primary me-2">{index + 1}</span>
                                                <strong>{product.nombre}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    {product.cantidad} unidades vendidas
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <strong className="text-success">
                                                    ${product.ingresos.toLocaleString('es-CL')}
                                                </strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rendimiento Repartidores */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">
                                <Truck className="me-2" size={20} />
                                Rendimiento de Repartidores
                            </h5>
                        </div>
                        <div className="card-body">
                            {repartidorStats.length === 0 ? (
                                <p className="text-muted text-center">No hay repartidores registrados</p>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {repartidorStats.map((rep, index) => (
                                        <div
                                            key={index}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <strong>{rep.nombre}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    Total: {rep.total} pedidos
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-success me-1">
                                                    ✓ {rep.entregas}
                                                </span>
                                                <span className="badge bg-primary">
                                                    🚚 {rep.enRuta}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen */}
            <div className="card shadow-sm border-info">
                <div className="card-body">
                    <h5 className="text-info mb-3">📊 Resumen del Periodo</h5>
                    <div className="row">
                        <div className="col-md-4">
                            <p className="mb-1">
                                <strong>Mejor día de ventas:</strong>
                            </p>
                            <p className="text-success">
                                {salesData.length > 0 
                                    ? salesData.reduce((max, d) => d.ventas > max.ventas ? d : max).fecha
                                    : 'N/A'
                                }
                            </p>
                        </div>
                        <div className="col-md-4">
                            <p className="mb-1">
                                <strong>Producto estrella:</strong>
                            </p>
                            <p className="text-primary">
                                {topProducts.length > 0 ? topProducts[0].nombre : 'N/A'}
                            </p>
                        </div>
                        <div className="col-md-4">
                            <p className="mb-1">
                                <strong>Mejor repartidor:</strong>
                            </p>
                            <p className="text-success">
                                {repartidorStats.length > 0 ? repartidorStats[0].nombre : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};