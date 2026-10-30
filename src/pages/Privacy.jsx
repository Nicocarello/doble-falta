import React from 'react';
import { Shield, Lock, Eye } from 'lucide-react';

const Privacy = () => {
    React.useEffect(() => {
        document.title = 'Política de Privacidad - DobleFalta';
    }, []);

    return (
        <div className="privacy-page" style={{
            padding: '100px 20px 40px 20px',
            maxWidth: '900px',
            margin: '0 auto',
            color: '#fff',
            lineHeight: '1.8'
        }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--ball-yellow)', marginBottom: '30px' }}>
                <Shield size={32} /> Política de Privacidad
            </h1>

            <p style={{ opacity: 0.8, marginBottom: '20px' }}>Última actualización: {new Date().toLocaleDateString()}</p>

            <section style={{ marginBottom: '40px' }}>
                <p>
                    Bienvenido a <strong>DobleFalta</strong>. Tu privacidad es de suma importancia para nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestra aplicación web.
                </p>
            </section>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <article>
                    <h3 style={{ borderBottom: '1px solid var(--ball-yellow)', paddingBottom: '10px', marginBottom: '15px' }}>
                        1. Información que recopilamos
                    </h3>
                    <p>
                        DobleFalta es una aplicación que funciona principalmente consultando una API de resultados de tenis. No requerimos que los usuarios creen una cuenta ni proporcionen información personal identificable (PII) de forma obligatoria, como nombre completo, dirección, documento de identidad o número de teléfono. Asimismo, garantizamos que ninguna información de identificación personal u otros datos sensibles de los usuarios serán transferidos a Google ni a otras plataformas publicitarias.
                    </p>
                </article>

                <article>
                    <h3 style={{ borderBottom: '1px solid var(--ball-yellow)', paddingBottom: '10px', marginBottom: '15px' }}>
                        2. Uso de Cookies y Tecnologías de Rastreo
                    </h3>
                    <p>
                        Utilizamos tecnologías estándar de la industria como "cookies" para mejorar la experiencia del usuario y analizar el tráfico de nuestro sitio mediante herramientas como Google Analytics. Las cookies son pequeños archivos de texto que se almacenan en su dispositivo para recopilar información estándar de registro de Internet e información sobre el comportamiento de los visitantes.
                    </p>
                </article>

                <article>
                    <h3 style={{ borderBottom: '1px solid var(--ball-yellow)', paddingBottom: '10px', marginBottom: '15px' }}>
                        3. Google AdSense y Cookies de Terceros
                    </h3>
                    <p>
                        Utilizamos Google AdSense para mostrar anuncios en nuestro sitio. Google, como proveedor tercero, utiliza cookies para publicar anuncios en nuestro sitio en función de las visitas anteriores del usuario a este u otros sitios web.
                    </p>
                    <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                        <li>Los proveedores de terceros, incluido Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores de un usuario a su sitio web o a otros sitios web.</li>
                        <li>El uso de cookies publicitarias permite a Google y a sus socios mostrar anuncios basados en las visitas de los usuarios a sus sitios o a otros sitios de Internet.</li>
                        <li>Los usuarios pueden inhabilitar la publicidad personalizada visitando <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ball-yellow)' }}>Configuración de anuncios</a>. (Alternativamente, puede indicar a los usuarios que inhabiliten el uso de cookies de un tercero para la publicidad personalizada visitando <a href="http://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ball-yellow)' }}>www.aboutads.info</a>).</li>
                    </ul>
                </article>

                <article>
                    <h3 style={{ borderBottom: '1px solid var(--ball-yellow)', paddingBottom: '10px', marginBottom: '15px' }}>
                        4. Seguridad de los Datos
                    </h3>
                    <p>
                        Implementamos una variedad de medidas de seguridad para proteger tu información. Utilizamos tecnologías de cifrado modernas (SSL/TLS) para proteger los datos mientras se transmiten entre tu navegador y nuestros servidores alojados en Google Firebase.
                    </p>
                </article>

                <article>
                    <h3 style={{ borderBottom: '1px solid var(--ball-yellow)', paddingBottom: '10px', marginBottom: '15px' }}>
                        5. Enlaces de Terceros
                    </h3>
                    <p>
                        Ocasionalmente, a nuestra discreción, podemos incluir u ofrecer productos o servicios de terceros en nuestro sitio web. Estos sitios de terceros tienen políticas de privacidad separadas e independientes. Por lo tanto, no tenemos responsabilidad alguna por el contenido y las actividades de estos sitios vinculados.
                    </p>
                </article>

                <article>
                    <h3 style={{ borderBottom: '1px solid var(--ball-yellow)', paddingBottom: '10px', marginBottom: '15px' }}>
                        6. Privacidad de Menores (COPPA)
                    </h3>
                    <p>
                        Nuestra aplicación web y servicios no están dirigidos a menores de 13 años. No recopilamos conscientemente información personal de niños menores de 13 años. Asimismo, no utilizamos sistemas de publicidad personalizada ni de remarketing basados en la actividad de usuarios menores de 13 años en cumplimiento de las normativas de la Ley de Protección de la Privacidad Infantil en Internet (COPPA). Si detectamos que se han recogido datos de un menor sin consentimiento, procederemos a eliminarlos inmediatamente.
                    </p>
                </article>
            </div>

            <footer style={{ marginTop: '50px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', fontSize: '0.9rem' }}>
                <p>Para cualquier consulta sobre esta política, por favor ponte en contacto con nosotros a través de nuestro correo: <strong>doblefaltat@gmail.com</strong></p>
            </footer>
        </div>
    );
};

export default Privacy;
