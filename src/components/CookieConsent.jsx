import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '1000px',
            background: 'rgba(28, 28, 28, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10000,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            gap: '20px',
            flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <ShieldCheck color="#cddc39" size={24} style={{ flexShrink: 0 }} />
                <p style={{ color: '#fff', fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                    Usamos cookies propias y de terceros para mostrar anuncios personalizados, analizar el tráfico y mejorar tu experiencia. 
                    Al continuar, aceptas nuestra <Link to="/privacy" style={{ color: '#cddc39', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>Política de Privacidad</Link>.
                </p>
            </div>
            <button 
                onClick={acceptCookies}
                style={{
                    background: '#cddc39',
                    color: '#000',
                    border: 'none',
                    padding: '10px 25px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
                Entendido
            </button>
        </div>
    );
};

export default CookieConsent;
