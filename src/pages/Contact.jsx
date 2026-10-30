import React from 'react';
import { Mail, MessageSquare, Clock } from 'lucide-react';

const Contact = () => {
    React.useEffect(() => {
        document.title = 'Contacto - DobleFalta';
    }, []);

    return (
        <div className="contact-page" style={{
            padding: '100px 20px 40px 20px',
            maxWidth: '900px',
            margin: '0 auto',
            color: '#fff',
            lineHeight: '1.8'
        }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--ball-yellow)', marginBottom: '30px' }}>
                <Mail size={32} /> Contacto
            </h1>

            <p style={{ fontSize: '1.1rem', marginBottom: '40px', opacity: 0.9 }}>
                ¿Tienes alguna sugerencia, reporte de error o consulta comercial? Estamos aquí para escucharte.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Mail size={20} /> Correo Electrónico
                    </h3>
                    <p style={{ marginBottom: '10px' }}>Para consultas generales y soporte:</p>
                    <a href="mailto:doblefaltat@gmail.com" style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', borderBottom: '2px solid var(--ball-yellow)' }}>
                        doblefaltat@gmail.com
                    </a>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={20} /> Tiempo de Respuesta
                    </h3>
                    <p>
                        Intentamos responder a todos los mensajes en un plazo de 24 a 48 horas hábiles.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '50px', padding: '30px', background: 'var(--clay-dark)', borderRadius: '15px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '15px' }}>Redes Sociales</h3>
                <p style={{ opacity: 0.7 }}>Síguenos para estar al tanto de las últimas actualizaciones del circuito.</p>
                {/* Aquí podrías agregar links a redes si existen */}
            </div>
        </div>
    );
};

export default Contact;
