import React, { useState } from 'react';
import './SuggestionModal.css';

const SuggestionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsSuccess(false);
      setError(null);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // REEMPLAZÁ ESTA CLAVE POR LA TUYA DE WEB3FORMS (ES GRATIS)
          access_key: "608c822d-38f6-41f4-98bb-23d95574aef8",
          subject: "Nueva sugerencia para Doble Falta",
          message: message,
          from_name: "Usuario de Doble Falta"
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setMessage('');
          setIsSuccess(false);
        }, 3000); // Cierra automáticamente después de 3 segundos
      } else {
        setError("Hubo un error al enviar tu sugerencia.");
      }
    } catch (err) {
      setError("Error de red. Verificá tu conexión a internet.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className="suggestion-fab" 
        onClick={toggleModal}
        aria-label="Abrir sugerencias"
        title="¡Dejanos tu sugerencia!"
      >
        💡
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="suggestion-modal-overlay" onClick={toggleModal}>
          <div className="suggestion-modal-content" onClick={e => e.stopPropagation()}>
            <div className="suggestion-modal-header">
              <h2 className="suggestion-modal-title">¿Qué mejorarías?</h2>
              <button className="suggestion-modal-close" onClick={toggleModal}>&times;</button>
            </div>
            
            <div className="suggestion-modal-body">
              <p>Doble Falta está en pleno desarrollo. ¡Tu opinión es clave para sumar nuevas funcionalidades y mejorar la experiencia!</p>
              
              {isSuccess ? (
                <div className="suggestion-success-message">
                  <p>¡Gracias! Tu sugerencia fue enviada con éxito. 🎾</p>
                </div>
              ) : (
                <>
                  <textarea 
                    className="suggestion-textarea"
                    placeholder="Escribí tu sugerencia, idea o reporte de error acá..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSending}
                  />
                  {error && <p className="suggestion-error-message">{error}</p>}
                </>
              )}
            </div>

            <div className="suggestion-modal-footer">
              <button 
                className="btn-cancel" 
                onClick={toggleModal}
                disabled={isSending}
              >
                {isSuccess ? "Cerrar" : "Cancelar"}
              </button>
              
              {!isSuccess && (
                <button 
                  className="btn-send" 
                  onClick={handleSend}
                  disabled={!message.trim() || isSending}
                >
                  {isSending ? "Enviando..." : "Enviar 🚀"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuggestionModal;
