import React from 'react';
import { Info, AlertCircle, FileText } from 'lucide-react';

const Terms = () => {
    React.useEffect(() => {
        document.title = 'Términos y Condiciones - DobleFalta';
    }, []);

    return (
        <div className="terms-page" style={{ 
            padding: '100px 20px 40px 20px', 
            maxWidth: '900px', 
            margin: '0 auto', 
            color: '#fff',
            lineHeight: '1.8'
        }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--ball-yellow)', marginBottom: '30px' }}>
                <FileText size={32} /> Términos y Condiciones
            </h1>
            
            <p style={{ opacity: 0.8, marginBottom: '40px' }}>Última actualización: {new Date().toLocaleDateString()}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <article>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px' }}>1. Aceptación de los términos</h3>
                    <p>Al acceder y utilizar <strong>DobleFalta</strong>, aceptas estar sujeto a estos Términos y Condiciones de Uso y a todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguna parte de estos términos, tienes prohibido usar o acceder a este sitio.</p>
                </article>

                <article>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px' }}>2. Licencia de Uso</h3>
                    <p>Se concede permiso para descargar temporalmente una copia de los materiales (incluida la aplicación web para uso como PWA) en el sitio web DobleFalta únicamente para visualización transitoria personal y no comercial. Esta es la concesión de una licencia, no una transferencia de título.</p>
                </article>

                <article>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px' }}>3. Descargo de Responsabilidad</h3>
                    <p>Los materiales en el sitio web de DobleFalta se proporcionan "tal cual". DobleFalta no ofrece garantías, expresas o implícitas, y por la presente renuncia y niega todas las demás garantías, incluidas, entre otras, las garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular o no infracción de propiedad intelectual u otra violación de derechos.</p>
                </article>

                <article>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px' }}>4. Precisión de los datos</h3>
                    <p>Aunque nos esforzamos por proporcionar los resultados de tenis más precisos y puntuales mediante el uso de APIs de terceros integradas, los datos se proporcionan con fines informativos únicamente y DobleFalta no garantiza su exactitud en tiempo real absoluto.</p>
                </article>

                <article>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px' }}>5. Enlaces externos</h3>
                    <p>DobleFalta no ha revisado todos los sitios vinculados a su sitio web o aplicación y no es responsable de los contenidos de ningún sitio vinculado.</p>
                </article>

                <article>
                    <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px' }}>6. Contenido Generado por el Usuario (Foros y Comunidad)</h3>
                    <p>
                        Al participar en nuestra sección de <strong>Comunidad / Foro</strong>, el usuario acepta de manera estricta <strong>no publicar</strong> contenido que:
                    </p>
                    <ul style={{ marginLeft: '20px', marginTop: '10px', listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '8px' }}>Incumpla leyes de propiedad intelectual, derechos de autor o sea considerado ilegal.</li>
                        <li style={{ marginBottom: '8px' }}>Incite al odio, violencia, discriminación, acoso o promueva autolesiones.</li>
                        <li style={{ marginBottom: '8px' }}>Contenga material sexual explícito o promueva actividades no consentidas.</li>
                        <li style={{ marginBottom: '8px' }}>Intente engañar mediante phishing, suplantación de identidad (fraude), malware o software malintencionado.</li>
                        <li style={{ marginBottom: '8px' }}>Constituya spam, contenido duplicado automatizado o publicidad encubierta.</li>
                    </ul>
                    <p style={{ marginTop: '10px' }}>
                        <strong>DobleFalta y sus administradores se reservan el derecho total e inapelable de eliminar cualquier mensaje, tema o intervención</strong> que vulnere este código de conducta para mantener un entorno seguro y dar cumplimiento estricto a las Políticas del Programa Google AdSense sobre contenido generado por usuarios.
                    </p>
                </article>
            </div>

            <footer style={{ marginTop: '50px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', fontSize: '0.9rem' }}>
                <p>El uso continuado de esta aplicación implica el conocimiento y aceptación de estos términos.</p>
            </footer>
        </div>
    );
};

export default Terms;
