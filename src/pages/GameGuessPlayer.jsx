import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTennis } from '../context/TennisContext';
import PLAYERS_DB from '../data/players_hints.json';
import SEO from '../components/common/SEO';
import './GameGuessPlayer.css';

const GameGuessPlayer = () => {
  const navigate = useNavigate();
  const { atpRankings, wtaRankings } = useTennis(); // Contexto para tener lista completa de sugerencias

  const [playerInfo, setPlayerInfo] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [globalStats, setGlobalStats] = useState({ played: 0, won: 0, streak: 0 });

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const wrapperRef = useRef(null);
  const MAX_ATTEMPTS = 5;

  // Cerrar dropdown de sugerencias si hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const [dateKey, setDateKey] = useState(null);

  // Obtener jugador del día (basado en hora de Argentina para que corte a las 00:00 de allá)
  const getDailyPlayer = () => {
    const now = new Date();
    const argTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    const todayKey = `${argTime.getFullYear()}-${argTime.getMonth() + 1}-${argTime.getDate()}`;

    // Usar la fecha como semilla para elegir el jugador
    let hash = 0;
    for (let i = 0; i < todayKey.length; i++) {
      hash = ((hash << 5) - hash) + todayKey.charCodeAt(i);
      hash |= 0;
    }
    
    const index = Math.abs(hash) % PLAYERS_DB.length;
    const selectedPlayer = PLAYERS_DB[index];

    // Mezclar pistas basado en el hash para que sea consistente para todos el mismo día
    const shuffledClues = [...selectedPlayer.clues];
    let seed = Math.abs(hash);
    
    // Fisher-Yates shuffle determinista usando un Generador Congruencial Lineal simple
    for (let i = shuffledClues.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [shuffledClues[i], shuffledClues[j]] = [shuffledClues[j], shuffledClues[i]];
    }

    return { 
      player: {
        ...selectedPlayer,
        clues: shuffledClues.slice(0, 5) // Máximo 5 pistas
      }, 
      todayKey 
    };
  };

  // Iniciar juego diario
  useEffect(() => {
    const { player, todayKey } = getDailyPlayer();
    setPlayerInfo(player);
    setDateKey(todayKey);

    // Cargar estado si ya jugó hoy
    const saved = localStorage.getItem(`df_guessgame_${todayKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setAttempts(parsed.attempts || []);
      setGameStatus(parsed.gameStatus || 'playing');
    } else {
      setAttempts([]);
      setGameStatus('playing');
    }

    // Cargar stats globales
    const savedStats = localStorage.getItem('df_guessgame_global_stats');
    if (savedStats) {
      setGlobalStats(JSON.parse(savedStats));
    }
  }, []);

  const normalizeString = (str) => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  // Manejar búsqueda y sugerencias
  const handleInputChange = (e) => {
    const val = e.target.value;
    setCurrentGuess(val);

    if (val.length >= 2) {
      const normalizedQuery = normalizeString(val);

      // Combinar rankings de ATP y WTA, además de los nombres en PLAYERS_DB por si falta alguno
      const allPlayerNames = new Set([
        ...PLAYERS_DB.map(p => p.name),
        ...atpRankings.map(r => r.player),
        ...wtaRankings.map(r => r.player)
      ]);

      const filtered = Array.from(allPlayerNames).filter(name =>
        normalizeString(name).includes(normalizedQuery)
      ).slice(0, 8); // Mostrar máximo 8 sugerencias

      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCurrentGuess(suggestion);
    setShowSuggestions(false);
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;

    // Si hay sugerencias visibles, Enter selecciona la primera
    if (showSuggestions && suggestions.length > 0) {
      setCurrentGuess(suggestions[0]);
      setShowSuggestions(false);
      return;
    }

    if (!currentGuess.trim()) return;

    const normalizedGuess = normalizeString(currentGuess);
    const newAttempts = [...attempts, currentGuess];

    // Check if correct
    const isCorrect = normalizeString(playerInfo.name) === normalizedGuess || 
                      playerInfo.aliases.some(alias => normalizeString(alias) === normalizedGuess);

    let newStatus = 'playing';
    if (isCorrect) {
      newStatus = 'won';
    } else if (newAttempts.length >= MAX_ATTEMPTS) {
      newStatus = 'lost';
    }

    setAttempts(newAttempts);
    setCurrentGuess('');
    setShowSuggestions(false);
    setGameStatus(newStatus);

    // Guardar progreso del día
    if (dateKey) {
      localStorage.setItem(`df_guessgame_${dateKey}`, JSON.stringify({
        attempts: newAttempts,
        gameStatus: newStatus
      }));
    }

    // Actualizar y Guardar Stats Globales si terminó el juego
    if (newStatus !== 'playing') {
      const statsStr = localStorage.getItem('df_guessgame_global_stats');
      let stats = statsStr ? JSON.parse(statsStr) : { played: 0, won: 0, streak: 0, lastPlayedKey: '' };
      
      if (stats.lastPlayedKey !== dateKey) {
        stats.played += 1;
        if (newStatus === 'won') {
          stats.won += 1;
          stats.streak += 1;
        } else {
          stats.streak = 0;
        }
        stats.lastPlayedKey = dateKey;
        localStorage.setItem('df_guessgame_global_stats', JSON.stringify(stats));
        setGlobalStats(stats);
      }
    }
  };

  const handleShare = () => {
    let squares = "";
    for(let i=0; i < MAX_ATTEMPTS; i++) {
      if (i < attempts.length) {
        if (i === attempts.length - 1 && gameStatus === 'won') {
          squares += "🟩";
        } else {
          squares += "🟥";
        }
      } else {
        squares += "🔲";
      }
    }
    const dateParsed = dateKey ? dateKey.split('-').reverse().join('/') : '';
    const txt = `🎾 DobleFalta: El Tenista del Día ${dateParsed}\nIntento: ${gameStatus === 'won' ? attempts.length : 'X'}/${MAX_ATTEMPTS} ${squares}\n¡Jugá vos también en https://doblefaltatenis.com.ar/juegos!`;
    
    if (navigator.share) {
      navigator.share({ title: 'DobleFalta Tenis', text: txt }).catch(console.error);
    } else {
      navigator.clipboard.writeText(txt);
      alert('¡Resultados copiados al portapapeles!');
    }
  };

  if (!playerInfo) return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>Cargando juego...</div>;

  const currentAttemptCount = attempts.length;

  return (
    <div className="guess-game fade-in">
      <SEO 
        title="Adivina el Tenista del Día"
        description="Pon a prueba tus conocimientos de tenis. ¿Puedes adivinar al jugador misterioso del día con solo 5 pistas? Un nuevo desafío cada día en Doble Falta."
        keywords="juego tenis, adivina el tenista, trivia tenis, wordle tenis, doble falta juegos, pistas tenis"
        canonicalUrl="/juegos/adivina"
      />
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <button className="back-btn" onClick={() => navigate('/juegos')}>
          ← VOLVER
        </button>
      </div>

      <div className="guess-game__header">
        <h1>🎾 Adivina el Tenista</h1>
        <p>Tienes {MAX_ATTEMPTS} intentos. Cada intento fallido revela una pista más específica.</p>
      </div>

      <div className="guess-game__clues-container">
        {playerInfo.clues.map((clue, index) => {
          // Pista desbloqueada si el intento es >= índice
          const isUnlocked = currentAttemptCount >= index || gameStatus !== 'playing';

          return (
            <div key={index} className={`guess-game__clue ${isUnlocked ? 'guess-game__clue--unlocked' : 'guess-game__clue--locked'}`}>
              <div className="clue-number">Pista {index + 1}</div>
              <div className="clue-text">
                {isUnlocked ? clue : '🔒 Bloqueada - Se revela al fallar el intento'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="guess-game__interaction">
        <div className="guess-game__status">
          Intento {Math.min(currentAttemptCount + 1, MAX_ATTEMPTS)} / {MAX_ATTEMPTS}
        </div>

        {gameStatus === 'playing' ? (
          <form className="guess-game__form" onSubmit={handleGuessSubmit} ref={wrapperRef}>
            <div className="autocomplete-wrapper">
              <input
                type="text"
                className="guess-game__input"
                placeholder="Busca y elige un tenista..."
                value={currentGuess}
                onChange={handleInputChange}
                autoFocus
              />

              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((sug, index) => (
                    <li key={index} onClick={() => handleSuggestionClick(sug)}>
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="submit" className="guess-game__submit-btn">Adivinar</button>
          </form>
        ) : (
          <div className={`guess-game__result ${gameStatus === 'won' ? 'result-won' : 'result-lost'}`}>
            <h2>{gameStatus === 'won' ? '🏆 ¡CORRECTO!' : '❌ JUEGO TERMINADO'}</h2>
            <p>El jugador era: <strong>{playerInfo.name}</strong></p>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', minWidth: '80px' }}>
                <div style={{ fontSize: '0.8rem', color: '#ccc' }}>Jugados</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{globalStats.played}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', minWidth: '80px' }}>
                <div style={{ fontSize: '0.8rem', color: '#ccc' }}>Victoria</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00e676' }}>
                  {globalStats.played > 0 ? Math.round((globalStats.won / globalStats.played) * 100) : 0}%
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', minWidth: '80px' }}>
                <div style={{ fontSize: '0.8rem', color: '#ccc' }}>Racha 🔥</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff9800' }}>{globalStats.streak}</div>
              </div>
            </div>

            <button 
              onClick={handleShare}
              style={{ marginTop: '20px', background: 'var(--ball-yellow)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%', maxWidth: '300px' }}
            >
              Compartir Resultado 🚀
            </button>

            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#bbb', fontSize: '0.95rem' }}>
                ¡Vuelve mañana para un nuevo tenista misterioso!
              </p>
            </div>
          </div>
        )}

        {attempts.length > 0 && (
          <div className="guess-game__history">
            <h3>Tus intentos:</h3>
            <ul className="attempt-list">
              {attempts.map((attempt, idx) => (
                <li key={idx} className={idx === currentAttemptCount - 1 && gameStatus === 'won' ? 'attempt-success' : 'attempt-fail'}>
                  {attempt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameGuessPlayer;
