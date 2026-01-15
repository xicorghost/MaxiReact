// components/WhatsAppButton.tsx

import React from 'react';
import { Phone } from 'lucide-react';

interface WhatsAppButtonProps {
    phoneNumber?: string;
    message?: string;
    text?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
    phoneNumber = '56912345678',
    message = 'Hola, necesito soporte técnico',
    text = 'SOPORTE TÉCNICO'
}) => {
    const handleClick = () => {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            onClick={handleClick}
            className="position-fixed bottom-0 start-0 m-3 btn btn-success rounded-pill shadow-lg d-flex align-items-center"
            style={{
                zIndex: 1000,
                backgroundColor: '#25D366',
                borderColor: '#25D366',
                padding: '12px 24px'
            }}
        >
            <Phone size={20} className="me-2" />
            {text}
        </button>
    );
};

export default WhatsAppButton;