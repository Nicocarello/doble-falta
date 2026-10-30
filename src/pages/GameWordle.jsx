import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameWordle.css';
import players from '../data/wordlePlayers.json';

const MAX_GUESSES = 6;

const getDailyWord = () => {
  const epochMs = new Date('2024-01-01T00:00:00').valueOf();
  const now = Date.now();
  const daysPassed = Math.floor((now - epochMs) / 86400000);
  const index = daysPassed % players.length;
  return players[index];
};

const getLetterStatusForWord = (targetWord, letter, i, guess) => {
  if (targetWord[i] === letter) return 'correct';
  
  if (targetWord.includes(letter)) {
    let targetCount = targetWord.split('').filter(l => l === letter).length;
    let correctCount = guess.split('').filter((l, idx) => l === letter && targetWord[idx] === letter).length;
    
    let presentCount = 0;
    for (let j = 0; j <= i; j++) {
      if (guess[j] === letter && targetWord[j] !== letter) {
        presentCount++;
      }
    }
    
    if (presentCount <= targetCount - correctCount) {
      return 'present';
    }
  }
  return 'absent';
};

const GameWordle = () => {
  const navigate = useNavigate();
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [shakeRow, setShakeRow] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ played: 0, wins: 0, currentStreak: 0, maxStreak: 0 });

  // Load game state
  useEffect(() => {
    const word = getDailyWord();
    setTargetWord(word);

    const savedState = localStorage.getItem('tenisdleState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.targetWord === word) {
        setGuesses(parsed.guesses);
        setGameStatus(parsed.gameStatus);
      }
    }

    const savedStats = localStorage.getItem('tenisdleStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    if (targetWord) {
      localStorage.setItem('tenisdleState', JSON.stringify({
        targetWord,
        guesses,
        gameStatus
      }));
    }
  }, [guesses, gameStatus, targetWord]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleGameOver = useCallback((status) => {
    setGameStatus(status);
    setStats(prev => {
      const newStats = { ...prev, played: prev.played + 1 };
      if (status === 'won') {
        newStats.wins += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      } else {
        newStats.currentStreak = 0;
      }
      localStorage.setItem('tenisdleStats', JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  const onKeyPress = useCallback((key) => {
    if (gameStatus !== 'playing') return;

    if (key === 'Enter') {
      if (currentGuess.length !== targetWord.length) {
        setShakeRow(true);
        showMessage('Letras insuficientes');
        setTimeout(() => setShakeRow(false), 500);
        return;
      }
      
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        handleGameOver('won');
      } else if (newGuesses.length >= MAX_GUESSES) {
        handleGameOver('lost');
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(key)) {
      if (currentGuess.length < targetWord.length) {
        setCurrentGuess(prev => prev + key.toUpperCase());
      }
    }
  }, [currentGuess, gameStatus, guesses, targetWord, handleGameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      onKeyPress(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const handleShare = () => {
    let shareText = `Tenisdle ${gameStatus === 'won' ? guesses.length : 'X'}/${MAX_GUESSES}\n\n`;
    guesses.forEach(guess => {
      let rowText = '';
      for (let i = 0; i < guess.length; i++) {
        const status = getLetterStatusForWord(targetWord, guess[i], i, guess);
        if (status === 'correct') rowText += '🟩';
        else if (status === 'present') rowText += '🟨';
        else rowText += '⬛';
      }
      shareText += rowText + '\n';
    });
    shareText += '\n¡Jugá vos también en https://doblefaltatenis.com.ar/juegos!';
    
    navigator.clipboard.writeText(shareText).then(() => {
      showMessage('¡Copiado al portapapeles!');
    }).catch(() => {
      showMessage('Error al copiar');
    });
  };

  // Keyboard status
  const keyboardStatus = {};
  guesses.forEach(guess => {
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const status = getLetterStatusForWord(targetWord, letter, i, guess);
      if (status === 'correct') {
        keyboardStatus[letter] = 'correct';
      } else if (status === 'present' && keyboardStatus[letter] !== 'correct') {
        keyboardStatus[letter] = 'present';
      } else if (status === 'absent' && !keyboardStatus[letter]) {
        keyboardStatus[letter] = 'absent';
      }
    }
  });

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
  ];

  if (!targetWord) return null;

  return (
    <div className="wordle-container fade-in">
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
        <button className="back-btn" onClick={() => navigate('/juegos')}>
          ← VOLVER
        </button>
      </div>
      
      <div className="wordle-header">
        <h1>Tenisdle</h1>
        <p>Adiviná el apellido del tenista de hoy</p>
      </div>

      {message && <div className="wordle-message">{message}</div>}

      <div className="wordle-board">
        {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guess = isCurrentRow ? currentGuess : guesses[rowIndex] || '';
          const isSubmitted = rowIndex < guesses.length;

          return (
            <div 
              key={rowIndex} 
              className={`wordle-row ${isCurrentRow && shakeRow ? 'shake' : ''}`}
              style={{ gridTemplateColumns: `repeat(${targetWord.length}, 1fr)` }}
            >
              {Array.from({ length: targetWord.length }).map((_, colIndex) => {
                const letter = guess[colIndex] || '';
                let statusClass = '';
                if (isSubmitted) {
                  statusClass = getLetterStatusForWord(targetWord, letter, colIndex, guess);
                }
                
                return (
                  <div 
                    key={colIndex} 
                    className={`wordle-cell ${letter ? 'filled' : ''} ${statusClass}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="wordle-keyboard">
        {keyboardRows.map((row, i) => (
          <div key={i} className="keyboard-row">
            {row.map(key => {
              const status = keyboardStatus[key] || '';
              return (
                <button
                  key={key}
                  className={`key ${key === 'Enter' || key === 'Backspace' ? 'key-wide' : ''} ${status}`}
                  onClick={() => onKeyPress(key)}
                >
                  {key === 'Backspace' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      
      {gameStatus === 'playing' && (
        <button className="btn-giveup" onClick={() => handleGameOver('lost')}>
          Me rindo 🏳️
        </button>
      )}
      
      {gameStatus !== 'playing' && (
        <div className={`top10-game__result ${gameStatus === 'won' ? 'result-won' : 'result-lost'}`} style={{ marginTop: '30px', width: '100%' }}>
          <h2>{gameStatus === 'won' ? '✅ ¡FELICITACIONES!' : '❌ JUEGO TERMINADO'}</h2>
          <p>El jugador oculto era <strong>{targetWord}</strong>.</p>
          
          <div style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '10px', borderRadius: '8px', minWidth: '80px' }}>
              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>Jugados</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.played}</div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '10px', borderRadius: '8px', minWidth: '80px' }}>
              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>Victoria</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00e676' }}>
                {stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0}%
              </div>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '10px', borderRadius: '8px', minWidth: '80px' }}>
              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>Racha 🔥</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff9800' }}>{stats.currentStreak}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button className="btn-share" onClick={handleShare}>Compartir Resultado🚀</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameWordle;
