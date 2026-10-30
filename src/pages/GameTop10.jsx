import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ATP_WEEKLY_DB from '../data/atp_weekly_top10.json';
import './GameTop10.css';

const GAME_DURATION = 180; // 3 minutes

const GameTop10 = () => {
  const navigate = useNavigate();
  
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'won', 'lost'
  
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isTimed, setIsTimed] = useState(true);
  const [isResuming, setIsResuming] = useState(false);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guessedPlayers, setGuessedPlayers] = useState([]);
  
  const [allPlayers, setAllPlayers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Daily logic states
  const [globalStats, setGlobalStats] = useState({ played: 0, won: 0, streak: 0, lastPlayedKey: '' });
  const [dateKey, setDateKey] = useState(null);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const getDailyWeek = () => {
    const keys = Object.keys(ATP_WEEKLY_DB);
    const now = new Date();
    const argTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    const todayKey = `${argTime.getFullYear()}-${argTime.getMonth() + 1}-${argTime.getDate()}`;

    let hash = 0;
    for (let i = 0; i < todayKey.length; i++) {
        hash = ((hash << 5) - hash) + todayKey.charCodeAt(i);
        hash |= 0;
    }

    // Mezcla adicional (finalizador tipo MurmurHash3) para evitar semanas consecutivas
    let h = hash;
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;

    const index = Math.abs(h) % keys.length;
    const randomKey = keys[index];

    return { weekKey: randomKey, weekData: ATP_WEEKLY_DB[randomKey], todayKey };
  };

  useEffect(() => {
    // 1. Initial setup of daily week
    const { weekKey, weekData, todayKey } = getDailyWeek();
    setSelectedWeek(weekData);
    setSelectedDateStr(parseDate(weekKey));
    setDateKey(todayKey);

    // 2. Extract unique names
    const names = new Set();
    Object.values(ATP_WEEKLY_DB).forEach(week => {
      week.forEach(p => names.add(p.name));
    });
    setAllPlayers(Array.from(names));

    // 3. Load daily save
    const saved = localStorage.getItem(`df_top10_${todayKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setGuessedPlayers(parsed.guessedPlayers || []);
      if (parsed.gameStatus && parsed.gameStatus !== 'playing') {
        setGameState('menu'); // stay on menu, but know we finished
        setHasPlayedToday(true);
      } else if (parsed.gameStatus === 'playing') {
        setIsResuming(true);
        if (parsed.isTimed !== undefined) setIsTimed(parsed.isTimed);
        if (parsed.timeLeft !== undefined) setTimeLeft(parsed.timeLeft);
      }
    }

    // 4. Load stats
    const savedStats = localStorage.getItem('df_top10_global_stats');
    if (savedStats) {
      setGlobalStats(JSON.parse(savedStats));
    }
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  // Parse YYYYMMDD to human readable
  const parseDate = (dateKey) => {
    if (!dateKey || dateKey.length !== 8) return dateKey;
    const year = dateKey.substring(0, 4);
    const month = dateKey.substring(4, 6);
    const day = dateKey.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  const normalizeString = (str) => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const matchGuess = (guess, fullName) => {
    const normGuess = normalizeString(guess);
    const normFull = normalizeString(fullName);
    const parts = normFull.split(' ');
    
    if (normGuess === normFull) return true;
    
    // Check just last name
    const lastName = parts[parts.length - 1];
    if (normGuess === lastName) return true;
    
    // Multi-word last names check
    if (parts.length >= 3) {
      if (parts[parts.length - 2] === 'del' && normGuess === `del ${lastName}`) return true;
      if (parts[parts.length - 2] === 'de' && normGuess === `de ${lastName}`) return true;
      if (parts[parts.length - 2] === 'van' && normGuess === `van ${lastName}`) return true;
      if (parts[parts.length - 2] === 'von' && normGuess === `von ${lastName}`) return true;
      // Also everything after first name
      if (normGuess === parts.slice(1).join(' ')) return true;
    }
    
    return false;
  };

  const handleGameOver = (newStatus, finalGuessed) => {
    setGameState(newStatus);
    setHasPlayedToday(true);

    if (dateKey) {
      localStorage.setItem(`df_top10_${dateKey}`, JSON.stringify({
        guessedPlayers: finalGuessed,
        gameStatus: newStatus,
        isTimed: isTimed,
        timeLeft: timeLeft
      }));
    }

    const statsStr = localStorage.getItem('df_top10_global_stats');
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
      localStorage.setItem('df_top10_global_stats', JSON.stringify(stats));
      setGlobalStats(stats);
    }
  };

  const handleStartGame = (timed) => {
    if (hasPlayedToday) {
      const saved = JSON.parse(localStorage.getItem(`df_top10_${dateKey}`));
      if (saved) setGameState(saved.gameStatus);
    } else if (isResuming) {
      setGameState('playing');
    } else {
      setIsTimed(timed);
      setGameState('playing');
      const nextTime = timed ? GAME_DURATION : null;
      setTimeLeft(nextTime);
      localStorage.setItem(`df_top10_${dateKey}`, JSON.stringify({
        guessedPlayers: [],
        gameStatus: 'playing',
        isTimed: timed,
        timeLeft: nextTime
      }));
    }
  };

  const handleGiveUp = () => {
    handleGameOver('lost', guessedPlayers);
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && isTimed && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          const saved = JSON.parse(localStorage.getItem(`df_top10_${dateKey}`) || '{}');
          if (saved && saved.gameStatus === 'playing') {
            saved.timeLeft = newTime;
            localStorage.setItem(`df_top10_${dateKey}`, JSON.stringify(saved));
          }
          return newTime;
        });
      }, 1000);
    } else if (gameState === 'playing' && isTimed && timeLeft <= 0) {
      handleGameOver('lost', guessedPlayers);
    }
    return () => clearInterval(timer);
  }, [gameState, isTimed, timeLeft, dateKey, guessedPlayers]);

  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  const checkGuess = (guess) => {
    if (!guess.trim() || !selectedWeek) return false;
    
    // Look for matching player
    const correctPlayer = selectedWeek.find(p => 
      !guessedPlayers.includes(p.rank) && matchGuess(guess, p.name)
    );

    if (correctPlayer) {
      const newGuessed = [...guessedPlayers, correctPlayer.rank];
      setGuessedPlayers(newGuessed);
      setCurrentGuess('');
      setShowSuggestions(false);
      setSuggestions([]);
      
      if (inputRef.current) {
        inputRef.current.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
        setTimeout(() => {
          if(inputRef.current) inputRef.current.style.backgroundColor = '';
        }, 300);
      }

      if (newGuessed.length === 10) {
        handleGameOver('won', newGuessed);
      } else {
        if (dateKey) {
          const saved = JSON.parse(localStorage.getItem(`df_top10_${dateKey}`) || '{}');
          localStorage.setItem(`df_top10_${dateKey}`, JSON.stringify({
            ...saved,
            guessedPlayers: newGuessed,
            gameStatus: 'playing'
          }));
        }
      }
      return true;
    }
    return false;
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCurrentGuess(val);
    
    const matched = checkGuess(val);
    
    if (!matched) {
      if (val.length >= 2) {
        const normalizedQuery = normalizeString(val);
        const filtered = allPlayers.filter(name => 
           normalizeString(name).includes(normalizedQuery)
        ).slice(0, 8);
        
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCurrentGuess(suggestion);
    setShowSuggestions(false);
    checkGuess(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameState === 'playing' && currentGuess.trim() !== '') {
      
      // If suggestions are visible, use the top suggestion when pressing Enter
      if (showSuggestions && suggestions.length > 0) {
        setCurrentGuess(suggestions[0]);
        setShowSuggestions(false);
        checkGuess(suggestions[0]);
        return;
      }

      // Just check if it's completely wrong on submit
      const isCorrect = selectedWeek.find(p => matchGuess(currentGuess, p.name));
      if (!isCorrect && inputRef.current) {
        inputRef.current.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        inputRef.current.classList.add('shake');
        setTimeout(() => {
          if(inputRef.current) {
            inputRef.current.style.backgroundColor = '';
            inputRef.current.classList.remove('shake');
          }
        }, 300);
      }
      setCurrentGuess('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    let resultEmoji = gameState === 'won' ? '🏆' : '💀';
    let boxes = gameState === 'won' ? '🟩' : '🟥';
    const dateParsed = dateKey ? dateKey.split('-').reverse().join('/') : '';
    const text = `🎾 DobleFalta: Top 10 Histórico del Día ${dateParsed} ${resultEmoji}\nRanking del: ${selectedDateStr}\nPuntuación: ${guessedPlayers.length}/10 ${boxes.repeat(guessedPlayers.length)}${'🔲'.repeat(10-guessedPlayers.length)}\n¡Jugá vos también en https://doblefaltatenis.com.ar/juegos!`;
    
    if (navigator.share) {
      navigator.share({ title: 'DobleFalta Tenis', text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('¡Resultados copiados al portapapeles!');
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="top10-game fade-in">
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
          <button className="back-btn" onClick={() => navigate('/juegos')}>
            ← VOLVER
          </button>
        </div>

        <div className="top10-game__header" style={{ marginTop: '40px' }}>
          <h1>🏆 Adivina el Top 10 Histórico</h1>
          <p style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Viajamos en el tiempo hacia una semana aleatoria entre el año 2000 y el presente. 
            Tienes 3 minutos para adivinar los 10 mejores del ranking ATP de esa semana.
          </p>
          <div style={{ marginTop: '15px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
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
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          {hasPlayedToday ? (
            <button className="top10-play-btn" style={{ fontSize: '1.2rem', padding: '15px 40px', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '30px' }} onClick={handleStartGame}>
              Ver Resultados
            </button>
          ) : isResuming ? (
            <button className="top10-play-btn" style={{ fontSize: '1.2rem', padding: '15px 40px', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', background: 'var(--ball-yellow)', color: '#000', borderRadius: '30px', fontWeight: 'bold' }} onClick={() => handleStartGame(true)}>
              Continuar Partida
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
              <h3 style={{ marginBottom: '15px', fontWeight: '600' }}>Elige tu modo de juego de hoy:</h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button 
                  className="top10-play-btn" 
                  style={{ fontSize: '1.1rem', padding: '15px 30px', border: 'none', cursor: 'pointer', background: '#333', color: '#fff', borderRadius: '30px', border: '1px solid #555', transition: 'transform 0.2s' }} 
                  onClick={() => handleStartGame(false)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Modo Relax (Sin Cronómetro)
                </button>
                <button 
                  className="top10-play-btn" 
                  style={{ fontSize: '1.1rem', padding: '15px 30px', border: 'none', cursor: 'pointer', background: 'var(--ball-yellow)', color: '#000', borderRadius: '30px', fontWeight: 'bold', transition: 'transform 0.2s' }} 
                  onClick={() => handleStartGame(true)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Modo Desafío (3 Minutos)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="top10-game fade-in">
      {gameState === 'playing' && (
      <div className="top10-playing-header">
        <button className="btn-secondary" onClick={handleGiveUp} style={{ borderColor: 'red', color: 'red' }}>Rendirse</button>
        {isTimed ? (
          <div className={`timer ${timeLeft < 30 ? 'timer-danger' : ''}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        ) : (
          <div className="timer" style={{ color: '#00e676', border: 'none', padding: '6px 0' }}>
            Modo Relax
          </div>
        )}
        <div className="score-counter">
          {guessedPlayers.length} / 10
        </div>
      </div>
      )}

      {gameState !== 'playing' && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
          <button className="back-btn" onClick={() => setGameState('menu')}>
            ← VOLVER AL MENÚ
          </button>
        </div>
      )}

      <div className="top10-game__header">
        <h2 style={{ fontSize: '1.8rem' }}>Ranking ATP del {selectedDateStr}</h2>
      </div>

      {gameState === 'playing' ? (
        <form className="top10-input-form" onSubmit={handleSubmit} ref={wrapperRef}>
          <div className="autocomplete-wrapper">
            <input
              ref={inputRef}
              type="text"
              placeholder="Escribe el nombre del tenista..."
              value={currentGuess}
              onChange={handleInputChange}
              disabled={gameState !== 'playing'}
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
        </form>
      ) : (
        <div className={`top10-game__result result-won`}>
            <h2>{gameState === 'won' ? '🏆 ¡COMPLETASTE EL TOP 10!' : '❌ JUEGO TERMINADO'}</h2>
            <p>Lograste adivinar {guessedPlayers.length} de 10 jugadores en la semana del {selectedDateStr}.</p>
            
            <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
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

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="btn-share" onClick={handleShare}>Compartir Resultado🚀</button>
            </div>
        </div>
      )}

      <div className="top10-board">
        {selectedWeek.map((player) => {
          const isGuessed = guessedPlayers.includes(player.rank);
          const revealPlayer = isGuessed || gameState !== 'playing';
          
          return (
            <div 
              key={player.rank} 
              className={`top10-slot ${isGuessed ? 'slot-guessed' : ''} ${!isGuessed && gameState !== 'playing' ? 'slot-missed' : ''}`}
            >
              <div className="slot-rank">{player.rank}</div>
              <div className="slot-info">
                <span className="slot-name">{revealPlayer ? player.name : '???'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameTop10;
