import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, Trophy } from 'lucide-react';

const NotFound = () => {
    React.useEffect(() => {
        document.title = 'Página no encontrada - DobleFalta';
    }, []);

    return (
        <div style={{ 
            padding: '120px 20px', 
            textAlign: 'center', 
            color: '#fff',
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{ 
                background: 'rgba(255,255,255,0.05)', 
                padding: '40px', 
                borderRadius: '20px',
                maxWidth: '500px'
            }}>
                <Search size={64} style={{ color: 'var(--ball-yellow)', marginBottom: '20px' }} />
                <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>404</h1>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>¡Oops! Pelota fuera.</h2>
                <p style={{ marginBottom: '30px', opacity: 0.8 }}>
                    La página que buscas no existe o ha sido movida. No te preocupes, puedes volver al partido principal aquí:
                </p>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <Link to="/" style={{ 
                        background: 'var(--clay-orange)', 
                        color: '#fff', 
                        padding: '12px 24px', 
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Home size={18} /> Inicio
                    </Link>
                    <Link to="/ranking" style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        color: '#fff', 
                        padding: '12px 24px', 
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Trophy size={18} /> Rankings
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
