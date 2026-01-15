// components/CustomModals.tsx

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import '../styles/customModals.css';

type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ModalOptions {
    titulo?: string;
    mensaje: string;
    tipo?: ModalType;
    textoBotonPrimario?: string;
    textoBotonSecundario?: string | null;
    input?: boolean;
    inputPlaceholder?: string;
}

interface CustomModalProps {
    show: boolean;
    options: ModalOptions;
    onClose: (result: boolean | string) => void;
}

const CustomModal: React.FC<CustomModalProps> = ({ show, options, onClose }) => {
    const [inputValue, setInputValue] = useState('');

    const {
        titulo = 'Aviso',
        mensaje,
        tipo = 'info',
        textoBotonPrimario = 'Aceptar',
        textoBotonSecundario = null,
        input = false,
        inputPlaceholder = 'Ingrese el valor...'
    } = options;

    useEffect(() => {
        if (show && input) {
            setTimeout(() => {
                const inputElement = document.getElementById('modal-input');
                inputElement?.focus();
            }, 100);
        }
    }, [show, input]);

    if (!show) return null;

    const getIcon = () => {
        switch (tipo) {
            case 'success':
                return <CheckCircle size={48} />;
            case 'error':
                return <XCircle size={48} />;
            case 'warning':
                return <AlertTriangle size={48} />;
            case 'info':
                return <Info size={48} />;
            case 'confirm':
                return <HelpCircle size={48} />;
            default:
                return <Info size={48} />;
        }
    };

    const getHeaderClass = () => {
        switch (tipo) {
            case 'success':
                return 'modal-header-success';
            case 'error':
                return 'modal-header-error';
            case 'warning':
                return 'modal-header-warning';
            case 'info':
                return 'modal-header-info';
            case 'confirm':
                return 'modal-header-confirm';
            default:
                return 'modal-header-info';
        }
    };

    const handleAccept = () => {
        if (input) {
            onClose(inputValue);
        } else {
            onClose(true);
        }
    };

    const handleCancel = () => {
        onClose(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input) {
            handleAccept();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !input && tipo !== 'confirm') {
            handleCancel();
        }
    };

    return (
        <div className="modal-overlay-personalizado show" onClick={handleOverlayClick}>
            <div className="modal-box-personalizado">
                <div className={`modal-header-personalizado ${getHeaderClass()}`}>
                    {getIcon()}
                    <h3>{titulo}</h3>
                </div>
                <div className="modal-body-personalizado">
                    <div dangerouslySetInnerHTML={{ __html: mensaje }} />
                    {input && (
                        <input
                            id="modal-input"
                            type="text"
                            className="modal-input-personalizado"
                            placeholder={inputPlaceholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    )}
                </div>
                <div className="modal-footer-personalizado">
                    {textoBotonSecundario && (
                        <button
                            className="btn-modal-personalizado btn-secondary"
                            onClick={handleCancel}
                        >
                            {textoBotonSecundario}
                        </button>
                    )}
                    <button
                        className={`btn-modal-personalizado ${tipo === 'success' ? 'btn-success' : 'btn-primary'}`}
                        onClick={handleAccept}
                    >
                        {textoBotonPrimario}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Hook personalizado para usar los modales
export const useCustomModal = () => {
    const [modalState, setModalState] = useState<{
        show: boolean;
        options: ModalOptions;
        resolver: ((value: boolean | string) => void) | null;
    }>({
        show: false,
        options: { mensaje: '' },
        resolver: null
    });

    const showModal = (options: ModalOptions): Promise<boolean | string> => {
        return new Promise((resolve) => {
            setModalState({
                show: true,
                options,
                resolver: resolve
            });
        });
    };

    const handleClose = (result: boolean | string) => {
        if (modalState.resolver) {
            modalState.resolver(result);
        }
        setModalState({
            show: false,
            options: { mensaje: '' },
            resolver: null
        });
    };

    const alerta = (mensaje: string, titulo: string = 'Aviso') => {
        return showModal({
            titulo,
            mensaje,
            tipo: 'info'
        });
    };

    const exito = (mensaje: string, titulo: string = '¡Éxito!') => {
        return showModal({
            titulo,
            mensaje,
            tipo: 'success',
            textoBotonPrimario: 'Entendido'
        });
    };

    const error = (mensaje: string, titulo: string = 'Error') => {
        return showModal({
            titulo,
            mensaje,
            tipo: 'error',
            textoBotonPrimario: 'Entendido'
        });
    };

    const advertencia = (mensaje: string, titulo: string = 'Advertencia') => {
        return showModal({
            titulo,
            mensaje,
            tipo: 'warning',
            textoBotonPrimario: 'Entendido'
        });
    };

    const confirmar = (mensaje: string, titulo: string = 'Confirmar acción') => {
        return showModal({
            titulo,
            mensaje,
            tipo: 'confirm',
            textoBotonPrimario: 'Confirmar',
            textoBotonSecundario: 'Cancelar'
        });
    };

    const preguntar = (mensaje: string, titulo: string = 'Ingrese información', placeholder?: string) => {
        return showModal({
            titulo,
            mensaje,
            tipo: 'info',
            textoBotonPrimario: 'Aceptar',
            textoBotonSecundario: 'Cancelar',
            input: true,
            inputPlaceholder: placeholder
        });
    };

    const mostrarDetalleUsuario = (usuario: any) => {
        let estadoDisponibilidad = '';
        if (usuario.rol === 'repartidor') {
            const disponible = usuario.disponible !== undefined ? usuario.disponible : true;
            estadoDisponibilidad = `<p><strong>Estado:</strong> <span style="color: ${disponible ? '#33A650' : '#F23838'}">${disponible ? 'Disponible' : 'Ocupado'}</span></p>`;
        }

        const contenido = `
      <div style="text-align: left;">
        <p><strong>ID:</strong> ${usuario.id}</p>
        <p><strong>Nombre:</strong> ${usuario.nombre} ${usuario.apellidos}</p>
        <p><strong>RUT:</strong> ${usuario.rut}</p>
        <p><strong>Email:</strong> ${usuario.email}</p>
        <p><strong>Teléfono:</strong> ${usuario.telefono || 'N/A'}</p>
        <p><strong>Tipo:</strong> ${usuario.rol.toUpperCase()}</p>
        ${estadoDisponibilidad}
        <p><strong>Fecha Registro:</strong> ${new Date(usuario.fechaRegistro).toLocaleString('es-CL')}</p>
      </div>
    `;

        return showModal({
            titulo: 'Información del Usuario',
            mensaje: contenido,
            tipo: 'info',
            textoBotonPrimario: 'Cerrar'
        });
    };

    const mostrarDetallePedido = (pedido: any) => {
        const productosHTML = pedido.productos.map((p: any) =>
            `<li style="margin-bottom: 8px;">• ${p.nombre} x${p.cantidad} - $${(p.precio * p.cantidad).toLocaleString('es-CL')}</li>`
        ).join('');

        const contenido = `
      <div style="text-align: left;">
        <p><strong>Número:</strong> ${pedido.numeroSolicitud}</p>
        <p><strong>Cliente:</strong> ${pedido.clienteNombre}</p>
        <p><strong>Dirección:</strong> ${pedido.direccion}, ${pedido.comuna}</p>
        <p><strong>Teléfono:</strong> ${pedido.telefono}</p>
        <p><strong>Estado:</strong> <span style="color: #F23838; font-weight: bold;">${pedido.estado}</span></p>
        <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString('es-CL')}</p>
        
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
        
        <p><strong>Productos:</strong></p>
        <ul style="list-style: none; padding-left: 0;">
          ${productosHTML}
        </ul>
        
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
        
        <p><strong>Subtotal:</strong> $${pedido.subtotal.toLocaleString('es-CL')}</p>
        <p><strong>Envío:</strong> $${pedido.envio.toLocaleString('es-CL')}</p>
        <p style="font-size: 1.2rem; color: #F23838;"><strong>Total:</strong> $${pedido.total.toLocaleString('es-CL')}</p>
        
        ${pedido.repartidorNombre ? `<p><strong>Repartidor:</strong> ${pedido.repartidorNombre}</p>` : ''}
      </div>
    `;

        return showModal({
            titulo: 'Detalle del Pedido',
            mensaje: contenido,
            tipo: 'info',
            textoBotonPrimario: 'Cerrar'
        });
    };

    return {
        CustomModalComponent: () => (
            <CustomModal
                show={modalState.show}
                options={modalState.options}
                onClose={handleClose}
            />
        ),
        alerta,
        exito,
        error,
        advertencia,
        confirmar,
        preguntar,
        mostrarDetalleUsuario,
        mostrarDetallePedido
    };
};

export default CustomModal;