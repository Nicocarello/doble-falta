import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Games.css';

const Games = () => {
  const navigate = useNavigate();

  const gamesList = [
    {
      id: 'adivina',
      title: 'Adivina el Tenista',
      icon: '🎾',
      color: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      status: 'active',
      path: '/juegos/adivina',
    },
    {
      id: 'top10',
      title: 'Top 10 Histórico',
      icon: '🏆',
      color: 'linear-gradient(135deg, #ff9900 0%, #d85a00 100%)',
      status: 'active',
      path: '/juegos/top10',
    },
    {
      id: 'racha-h2h',
      title: 'H2H',
      icon: '⚔️',
      color: 'linear-gradient(135deg, #e65c00 0%, #F9D423 100%)',
      status: 'active',
      path: '/juegos/racha-h2h',
    },
    {
      id: 'wordle',
      title: 'Tenisdle',
      icon: '📝',
      color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      status: 'active',
      path: '/juegos/tenisdle'
    }
  ];

  return (
    <div className="games-hub fade-in">
      <div className="games-hub__header">
        <h1 className="games-hub__title">
          Lista de Juegos
        </h1>
        <p className="games-hub__subtitle">
          Poné a prueba tus conocimientos sobre tenis con nuestros minijuegos.
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
    </div>
  );
};

export default Games;
