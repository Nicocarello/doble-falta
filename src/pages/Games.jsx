import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import './Games.css';

const Games = () => {
  const navigate = useNavigate();

  const gamesList = [
    {
      id: 'adivina',
      title: 'Adivina el Tenista',
      description: 'Descubrí al jugador oculto del día a partir de hasta 5 pistas sobre su nacionalidad, títulos, ranking y estilo de juego.',
      icon: '🎾',
      color: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      status: 'active',
      path: '/juegos/adivina',
    },
    {
      id: 'top10',
      title: 'Top 10 Histórico',
      description: 'Viajá a una semana histórica del circuito ATP desde 1990 hasta hoy y completá los 10 mejores tenistas de aquel ranking.',
      icon: '🏆',
      color: 'linear-gradient(135deg, #ff9900 0%, #d85a00 100%)',
      status: 'active',
      path: '/juegos/top10',
    },
    {
      id: 'racha-h2h',
      title: 'Racha Head-to-Head (H2H)',
      description: 'Dos tenistas frente a frente: elegí quién domina el historial oficial de enfrentamientos directos y sumá la mayor racha.',
      icon: '⚔️',
      color: 'linear-gradient(135deg, #e65c00 0%, #F9D423 100%)',
      status: 'active',
      path: '/juegos/racha-h2h',
    },
    {
      id: 'wordle',
      title: 'Tenisdle',
      description: 'El clásico desafío diario de palabras adaptado a los apellidos de las grandes figuras de la historia del tenis.',
      icon: '📝',
      color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      status: 'active',
      path: '/juegos/tenisdle'
    }
  ];

  return (
    <div className="games-hub fade-in">
      <SEO
        title="Juegos y Trivias de Tenis: Adivina el Tenista, Top 10 Histórico y H2H - DobleFalta"
        description="Poné a prueba tus conocimientos sobre la historia del tenis, el ranking ATP/WTA y las grandes rivalidades con los desafíos diarios interactivos de DobleFalta."
        canonicalUrl="/juegos"
      />
      <div className="games-hub__header">
        <h1 className="games-hub__title">
          Juegos y Desafíos Diarios de Tenis
        </h1>
        <p className="games-hub__subtitle">
          Poné a prueba tu memoria sobre estadísticas, rankings históricos y leyendas del circuito ATP y WTA.
        </p>
      </div>

      <div className="games-grid">
        {gamesList.map((game) => (
          <div
            key={game.id}
            className={`game-card ${game.status === 'coming_soon' ? 'game-card--disabled' : ''}`}
            style={{ background: game.color }}
            onClick={() => {
              if (game.status === 'active') {
                navigate(game.path);
              }
            }}
          >
            <div className="game-card__icon">{game.icon}</div>
            <div className="game-card__content">
              <h2 className="game-card__title">{game.title}</h2>
              <p className="game-card__desc">{game.description}</p>
            </div>
            {game.status === 'coming_soon' && (
              <div className="game-card__badge">Próximamente</div>
            )}
            {game.id === 'racha-h2h' && (
              <div className="game-card__badge game-card__badge--new">¡NUEVO!</div>
            )}
            {game.status === 'active' && game.id !== 'racha-h2h' && (
              <div className="game-card__badge game-card__badge--active">¡Jugar Ahora!</div>
            )}
            <div className="game-card__overlay"></div>
          </div>
        ))}
      </div>

      {/* Guía explicativa e histórica para enriquecer el valor editorial de la sección */}
      <section style={{
        maxWidth: '860px',
        margin: '45px auto 20px',
        padding: '30px 24px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        color: '#ccc',
        lineHeight: '1.8',
        fontSize: '0.94rem'
      }}>
        <h2 style={{ color: 'var(--ball-yellow)', fontSize: '1.4rem', marginTop: 0, marginBottom: '15px' }}>
          Historia, Estadísticas y Rivalidades detrás de nuestros Desafíos de Tenis
        </h2>
        <p style={{ marginBottom: '14px' }}>
          La sección de juegos interactivos de <strong>DobleFalta</strong> fue diseñada por apasionados del deporte blanco utilizando bases de datos históricas oficiales de la Era Abierta. Cada uno de nuestros cuatro desafíos diarios propone explorar una dimensión distinta de la cultura tenística:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '18px' }}>
          <li style={{ marginBottom: '10px' }}>
            <strong>Adivina el Tenista del Día:</strong> Se renueva cada medianoche (hora de Argentina) seleccionando a un protagonista histórico o actual del circuito. A medida que arriesgás nombres, se desbloquean pistas progresivas como su mano hábil, su mejor puesto histórico en el ranking ATP/WTA, sus títulos de Grand Slam o su desempeño en Copa Davis.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Top 10 Histórico ATP:</strong> Recorre más de tres décadas de clasificaciones semanales oficiales desde 1990. Es una cápsula del tiempo ideal para recordar en qué años coincidieron dentro de los diez primeros figuras como Pete Sampras, Andre Agassi, Marcelo Ríos, Gustavo Kuerten, Guillermo Coria, Gastón Gaudio, David Nalbandian, Juan Martín del Potro o el <em>Big Three</em>.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Racha Head-to-Head (H2H):</strong> Consulta en vivo los registros oficiales de enfrentamientos directos entre dos jugadores del Top 60 de la ATP o la WTA. En el tenis, los estilos hacen a los partidos: muchas veces un jugador de menor ranking domina el historial frente a un Top 10 por cuestiones tácticas o de superficie.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>Tenisdle:</strong> Nuestro homenaje al formato Wordle enfocado exclusivamente en apellidos de tenistas profesionales, poniendo a prueba tu precisión en un máximo de seis intentos.
          </li>
        </ul>
        <p style={{ margin: 0 }}>
          ¿Querés repasar la historia antes de jugar? Visitá nuestra sección de <Link to="/noticias" style={{ color: 'var(--ball-yellow)' }}>Crónicas e Historia del Tenis Argentino</Link> con artículos especiales sobre <Link to="/noticias/legion-argentina-anos-2000-nalbandian-coria-gaudio-canas" style={{ color: 'var(--ball-yellow)' }}>La Era Dorada de la Legión en los años 2000</Link> y <Link to="/noticias/guillermo-vilas-legado-historia-tenis-argentino" style={{ color: 'var(--ball-yellow)' }}>El legado histórico de Guillermo Vilas</Link>.
        </p>
      </section>
    </div>
  );
};

export default Games;
