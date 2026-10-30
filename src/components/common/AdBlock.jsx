import React, { useEffect } from 'react';

/**
 * Componente reutilizable para bloques de anuncios de Google AdSense.
 * @param {string} slot - El ID del bloque de anuncios (proporcionado por AdSense).
 * @param {string} format - Formato del anuncio ('auto', 'fluid', 'rectangle', etc).
 * @param {boolean} responsive - Si debe ajustarse automáticamente.
 */
const AdBlock = ({ slot, format = 'auto', responsive = 'true' }) => {
  useEffect(() => {
    try {
      // Notificamos a Google que hay un nuevo bloque que renderizar
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense error:", e);
    }
  }, []);

  return (
    <div className="ad-container" style={{ margin: '20px 0', textAlign: 'center', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-2118159773062473"
           data-ad-slot={slot}
           data-ad-format={format}
           data-full-width-responsive={responsive}></ins>
    </div>
  );
};

export default AdBlock;
