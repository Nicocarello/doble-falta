import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Shield, Info, Activity } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="main-footer" style={{
            background: 'var(--clay-dark)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '40px 20px 20px 20px',
            marginTop: 'auto',
            color: '#cacaca'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '30px', marginBottom: '30px' }}>

                    {/* Sección Marca */}
                    <div className="footer-section">
                        <h4 style={{ color: 'var(--ball-yellow)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                            <Activity size={20} /> DobleFalta
                        </h4>
                        <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                            Tu plataforma definitiva para resultados de tenis en vivo, estadísticas ATP, WTA y más. La pasión del tenis en tiempo real.
                        </p>
                    </div>

                    {/* Enlaces Rápidos */}
                    <div className="footer-section">
                        <h5 style={{ color: '#fff', marginBottom: '15px' }}>Explorar</h5>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'var(--ball-yellow)' } }}>Partidos de Hoy</Link></li>
                            <li><Link to="/noticias" style={{ color: 'inherit', textDecoration: 'none' }}>Noticias y Crónicas</Link></li>
                            <li><Link to="/ranking" style={{ color: 'inherit', textDecoration: 'none' }}>Ranking Mundial</Link></li>
                            <li><Link to="/tournaments" style={{ color: 'inherit', textDecoration: 'none' }}>Torneos</Link></li>
                            <li><Link to="/comunidad" style={{ color: 'inherit', textDecoration: 'none' }}>Foro y Comunidad</Link></li>
                        </ul>
                    </div>

                    {/* Legal - OBLIGATORIO PARA ADSENSE */}
                    <div className="footer-section">
                        <h5 style={{ color: '#fff', marginBottom: '15px' }}>Legal y Más</h5>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Sobre Nosotros</Link></li>
                            <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</Link></li>
                            <li><Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Política de Privacidad</Link></li>
                            <li><Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Términos y Condiciones</Link></li>
                        </ul>
                    </div>

                    {/* Redes Sociales */}
                    <div className="footer-section">
                        <h5 style={{ color: '#fff', marginBottom: '15px' }}>Seguinos en</h5>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li>
                                <a href="https://x.com/doblefaltat" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '20px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    opacity: 0.7
                }}>
                    <p>&copy; {currentYear} DobleFalta Tenis — Pasión por el circuito profesional. <br />
                        Proporcionado por aficionados para aficionados.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
