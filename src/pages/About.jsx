import React from 'react';
import { Info, Users, Target, Award } from 'lucide-react';

const About = () => {
    React.useEffect(() => {
        document.title = 'Sobre Nosotros - DobleFalta';
    }, []);

    return (
        <div className="about-page" style={{ 
            padding: '100px 20px 40px 20px', 
            maxWidth: '900px', 
            margin: '0 auto', 
            color: '#fff',
            lineHeight: '1.8'
        }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--ball-yellow)', marginBottom: '30px' }}>
                <Info size={32} /> Sobre DobleFalta
            </h1>
            
            <section style={{ marginBottom: '50px' }}>
                <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                    <strong>DobleFalta</strong> es un proyecto nacido de la pasión por el tenis. Nuestra misión es proporcionar a los aficionados una plataforma moderna, rápida y estética para seguir el circuito profesional ATP y WTA.
                </p>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                <article>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Target size={24} /> Nuestra Visión
                    </h3>
                    <p>
                        Queremos simplificar la forma en que los fans acceden a los resultados. En un mundo lleno de sitios sobrecargados de información, DobleFalta apuesta por la limpieza visual y la relevancia del contenido.
                    </p>
                </article>

                <article>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={24} /> Comunidad
                    </h3>
                    <p>
                        DobleFalta pone especial énfasis en los jugadores argentinos y latinoamericanos, brindando un seguimiento cercano a sus trayectorias en el circuito mundial y en los torneos Challenger.
                    </p>
                </article>

                <article>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Award size={24} /> Calidad de Datos
                    </h3>
                    <p>
                        Utilizamos integraciones de alta fidelidad para asegurar que los resultados, rankings y estadísticas que ves sean lo más precisos posible dentro del ecosistema del tenis profesional.
                    </p>
                </article>
            </div>

            <div style={{ marginTop: '60px', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ color: 'var(--ball-yellow)', marginBottom: '20px' }}>Proyecto Independiente y Regional</h2>
                <p style={{ marginBottom: '20px' }}>
                    A diferencia de las grandes plataformas globales, <strong>DobleFalta</strong> surge como un esfuerzo independiente para cubrir los nichos que los medios masivos suelen omitir. Nos enfocamos en el <strong>"tenis de ascenso"</strong>, siguiendo paso a paso el progreso de los jugadores en el circuito Challenger e ITF.
                </p>
                <p>
                    Creemos que cada punto ganado en un torneo de menor categoría es tan valioso como uno en un Grand Slam para el futuro del tenis regional. Por eso, nuestra plataforma está optimizada para que encuentres esos resultados que no siempre están en la portada de los diarios deportivos.
                </p>
            </div>
        </div>
    );
};

export default About;
