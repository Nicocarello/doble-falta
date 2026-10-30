import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTennis } from '../context/TennisContext';
import { fetchFromApi } from '../services/tennisApi';
import PlayerFlag from '../components/common/PlayerFlag';
import SEO from '../components/common/SEO';
import './GameH2H.css';

const GameH2H = () => {
  const navigate = useNavigate();
  const { atpRankings, wtaRankings, playerProfiles, fetchPlayerProfile } = useTennis();

  // Game configuration & status states
  const [circuit, setCircuit] = useState(''); // 'ATP' or 'WTA'
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [roundPhase, setRoundPhase] = useState('fetching'); // 'fetching', 'guessing', 'result'
  
  // Players in current round
  const [activePlayer, setActivePlayer] = useState(null);
  const [challengerPlayer, setChallengerPlayer] = useState(null);
  const [imgErrorActive, setImgErrorActive] = useState(false);
  const [imgErrorChallenger, setImgErrorChallenger] = useState(false);
  
  // Score statistics & storage
  const [streak, setStreak] = useState(0);
  const [selectedGuess, setSelectedGuess] = useState(null); // 'active' or 'challenger'
  const [isCorrect, setIsCorrect] = useState(false);
  
  const [h2hWins, setH2hWins] = useState({ active: 0, challenger: 0, totalMatches: 0 });
  const [loadingError, setLoadingError] = useState(false);

  // Setting to filter only players who have played each other
  const [onlyPlayedEachOther, setOnlyPlayedEachOther] = useState(() => {
    const saved = localStorage.getItem('df_h2h_only_played_each_other');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save option to local storage
  useEffect(() => {
    localStorage.setItem('df_h2h_only_played_each_other', JSON.stringify(onlyPlayedEachOther));
  }, [onlyPlayedEachOther]);

  // Global stats from local storage
  const [globalStats, setGlobalStats] = useState({ played: 0, bestStreak: 0 });

  // Load stats on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('df_h2h_streak_stats');
    if (savedStats) {
      setGlobalStats(JSON.parse(savedStats));
    }
  }, []);

  // Filter rankings to valid list
  const playerPool = useMemo(() => {
    if (!circuit) return [];
    const rankings = circuit === 'ATP' ? atpRankings : wtaRankings;
    // Keep top 60 players who have valid names and keys to make H2H matches more likely
    const valid = rankings.filter(p => p.player_key && p.player);
    return valid.slice(0, Math.min(60, valid.length));
  }, [circuit, atpRankings, wtaRankings]);

  // Pre-load photos/flags when players are chosen
  useEffect(() => {
    if (activePlayer?.player_key) fetchPlayerProfile(activePlayer.player_key);
    if (challengerPlayer?.player_key) fetchPlayerProfile(challengerPlayer.player_key);
    setImgErrorActive(false);
    setImgErrorChallenger(false);
  }, [activePlayer, challengerPlayer, fetchPlayerProfile]);

  // Select a random player from the pool, excluding a specific key if provided
  const getRandomPlayer = useCallback((excludeKey = null) => {
    if (playerPool.length < 2) return null;
    let filtered = playerPool;
    if (excludeKey) {
      filtered = playerPool.filter(p => p.player_key.toString() !== excludeKey.toString());
    }
    const idx = Math.floor(Math.random() * filtered.length);
    return filtered[idx];
  }, [playerPool]);

  // Fetch H2H details between two players
  const loadRoundMatchup = useCallback(async (p1, p2, retryCount = 0) => {
    setRoundPhase('fetching');
    setLoadingError(false);
    try {
      const res = await fetchFromApi('get_H2H', {
        first_player_key: p1.player_key,
        second_player_key: p2.player_key,
      });

      const hasPlayed = res.success === 1 && res.result?.H2H && res.result.H2H.length > 0;

      if (onlyPlayedEachOther && !hasPlayed && retryCount < 15) {
        const newChallenger = getRandomPlayer(p1.player_key);
        if (newChallenger) {
          setChallengerPlayer(newChallenger);
          await loadRoundMatchup(p1, newChallenger, retryCount + 1);
          return;
        }
      }

      if (!hasPlayed) {
        // Fallback or treat as 0 wins each if no H2H exists
        setH2hWins({ active: 0, challenger: 0, totalMatches: 0 });
      } else {
        const p1KeyStr = String(p1.player_key);
        const p2KeyStr = String(p2.player_key);

        let p1Wins = 0;
        let p2Wins = 0;
        
        res.result.H2H.forEach(m => {
          const winnerKey = m.event_winner === 'First Player'
            ? String(m.first_player_key)
            : String(m.second_player_key);

          if (winnerKey === p1KeyStr) p1Wins++;
          else if (winnerKey === p2KeyStr) p2Wins++;
        });

        setH2hWins({ active: p1Wins, challenger: p2Wins, totalMatches: res.result.H2H.length });
      }
      setRoundPhase('guessing');
    } catch (e) {
      console.error("Error fetching H2H for game:", e);
      setLoadingError(true);
    }
  }, [onlyPlayedEachOther, getRandomPlayer]);

  // Start a completely new game
  const handleStartGame = (selectedCircuit) => {
    setCircuit(selectedCircuit);
    setStreak(0);
    setGameState('playing');
    
    // We need to wait for playerPool to be populated, so we'll rely on a temporary effect
  };

  // Triggered when circuit and playerPool are ready or when game restarts
  useEffect(() => {
    if (gameState === 'playing' && playerPool.length >= 2 && !activePlayer) {
      const p1 = getRandomPlayer();
      const p2 = getRandomPlayer(p1.player_key);
      setActivePlayer(p1);
      setChallengerPlayer(p2);
      loadRoundMatchup(p1, p2);
    }
  }, [gameState, playerPool, activePlayer, getRandomPlayer, loadRoundMatchup]);

  // Handle a guess input
  const handleGuess = (guess) => {
    if (roundPhase !== 'guessing') return;
    
    setSelectedGuess(guess);
    const activeWinner = h2hWins.active >= h2hWins.challenger;
    const challengerWinner = h2hWins.challenger >= h2hWins.active;

    let correct = false;
    if (guess === 'active' && activeWinner) correct = true;
    if (guess === 'challenger' && challengerWinner) correct = true;

    setIsCorrect(correct);
    setRoundPhase('result');

    if (correct) {
      setStreak(prev => prev + 1);
    } else {
      // Game Over: update global stats
      const nextPlayed = globalStats.played + 1;
      const nextBest = Math.max(globalStats.bestStreak, streak);
      const newStats = { played: nextPlayed, bestStreak: nextBest };
      setGlobalStats(newStats);
      localStorage.setItem('df_h2h_streak_stats', JSON.stringify(newStats));
    }
  };

  // Move to the next round
  const handleNextRound = () => {
    // The player with the better record continues. In case of tie, the player they guessed continues.
    let survivor = activePlayer;
    if (h2hWins.challenger > h2hWins.active) {
      survivor = challengerPlayer;
    } else if (h2hWins.active === h2hWins.challenger) {
      survivor = selectedGuess === 'active' ? activePlayer : challengerPlayer;
    }

    const nextChallenger = getRandomPlayer(survivor.player_key);
    
    setActivePlayer(survivor);
    setChallengerPlayer(nextChallenger);
    setSelectedGuess(null);
    setIsCorrect(false);
    
    if (nextChallenger) {
      loadRoundMatchup(survivor, nextChallenger);
    }
  };

  // Finalize game over screen
  const handleShowResults = () => {
    setGameState('gameover');
  };

  // Restart after game over
  const handleRestart = () => {
    setActivePlayer(null);
    setChallengerPlayer(null);
    setStreak(0);
    setSelectedGuess(null);
    setIsCorrect(false);
    setGameState('playing');
  };

  // Quit to main game menu
  const handleQuitToMenu = () => {
    setActivePlayer(null);
    setChallengerPlayer(null);
    setStreak(0);
    setSelectedGuess(null);
    setIsCorrect(false);
    setCircuit('');
    setGameState('menu');
  };

  // Share results copy-to-clipboard or share-sheet
  const handleShare = () => {
    const tourLabel = circuit === 'ATP' ? 'ATP Tour ♂️' : 'WTA Tour ♀️';
    const text = `🎾 DobleFalta: Racha Head-to-Head (${tourLabel})\n🔥 Racha máxima de aciertos consecutiva: ${streak} matchups!\n¿Puedes superarme? Juega en: https://doblefaltatenis.com.ar/juegos`;

    if (navigator.share) {
      navigator.share({ title: 'DobleFalta Tenis - Racha H2H', text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('¡Tu resultado ha sido copiado al portapapeles! Compártelo con tus amigos 🚀');
    }
  };

  // Helper values for photos
  const activeLogo = activePlayer ? playerProfiles[activePlayer.player_key]?.logo : null;
  const challengerLogo = challengerPlayer ? playerProfiles[challengerPlayer.player_key]?.logo : null;

  return (
    <div className="h2h-game-container fade-in">
      <SEO 
        title="Racha H2H - Adivina el historial"
        description="Pon a prueba tu conocimiento de tenis y adivina qué jugador domina el historial en enfrentamientos directos. ¡Logra la racha más larga sin fallar!"
        keywords="racha h2h, head to head tenis, juego tenis, trivia tenis, records tenis, doble falta"
        canonicalUrl="/juegos/racha-h2h"
      />

      {gameState === 'menu' && (
        <div className="h2h-game-menu" style={{ width: '100%' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <button className="back-btn" onClick={() => navigate('/juegos')}>
              ← VOLVER
            </button>
          </div>

          <div className="h2h-game-menu__hero">
            <span className="h2h-game-menu__icon">⚔️</span>
            <h1>Racha Head to Head</h1>
            <p>
              Se presentarán dos tenistas activos. ¿Quién lidera el historial (H2H) de partidos entre ellos?
              Si aciertas o están empatados, el ganador continúa en cancha y entra un nuevo retador.
              ¡Acierta tantos como puedas sin fallar!
            </p>
          </div>

          <div className="h2h-game-menu__stats">
            <div className="h2h-stat-card">
              <span className="h2h-stat-label">Jugados</span>
              <span className="h2h-stat-value">{globalStats.played}</span>
            </div>
            <div className="h2h-stat-card">
              <span className="h2h-stat-label">Mejor Racha 🔥</span>
              <span className="h2h-stat-value text-gold">{globalStats.bestStreak}</span>
            </div>
          </div>

          <div className="h2h-game-menu__options">
            <div className="h2h-filter-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
              <label className="h2h-filter-container">
                <input 
                  type="checkbox" 
                  className="h2h-filter-checkbox" 
                  checked={onlyPlayedEachOther} 
                  onChange={(e) => setOnlyPlayedEachOther(e.target.checked)}
                />
                <span className="h2h-filter-label-text">
                  Solo enfrentar jugadores con historial previo (evitar 0 - 0)
                </span>
              </label>
            </div>

            <h2>Elige el circuito para comenzar:</h2>
            <div className="h2h-menu-buttons">
              <button 
                className="h2h-btn-start atp-start" 
                onClick={() => handleStartGame('ATP')}
              >
                🎾 Circuito ATP (Masculino)
              </button>
              <button 
                className="h2h-btn-start wta-start" 
                onClick={() => handleStartGame('WTA')}
              >
                🎾 Circuito WTA (Femenino)
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="h2h-game-play">
          <div className="h2h-game-play__header">
            <button className="h2h-btn-quit" onClick={handleQuitToMenu}>
              Salir al Menú
            </button>
            <div className="h2h-game-play__streak">
              Racha Actual: <span className="streak-count">{streak}</span> 🔥
            </div>
          </div>

          {roundPhase === 'fetching' && (
            <div className="h2h-game-loading">
              <div className="h2h-spinner"></div>
              <p>Consultando historiales...</p>
            </div>
          )}

          {loadingError && (
            <div className="h2h-game-error">
              <p>Hubo un problema al consultar la API externa.</p>
              <button onClick={() => loadRoundMatchup(activePlayer, challengerPlayer)}>Reintentar</button>
            </div>
          )}

          {roundPhase !== 'fetching' && activePlayer && challengerPlayer && (
            <div className="h2h-game-matchup-arena">
              <h2 className="matchup-prompt">
                {roundPhase === 'guessing' ? '¿Quién lidera el historial (H2H)?' : (isCorrect ? '¡Correcto! 🏆' : '¡Incorrecto! ❌')}
              </h2>

              <div className="matchup-vs-container">
                {/* Active Player Card */}
                <div 
                  className={`player-comparison-card ${roundPhase === 'guessing' ? 'clickable' : ''} 
                    ${roundPhase === 'result' && selectedGuess === 'active' ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}
                    ${roundPhase === 'result' && selectedGuess === 'challenger' && !isCorrect ? 'is-correct-border' : ''}`}
                  onClick={() => handleGuess('active')}
                >
                  <div className="player-card__rank">Rank: {activePlayer.place || '-'}</div>
                  <div className="player-card__photo-container">
                    {activeLogo && !imgErrorActive ? (
                      <img src={activeLogo} className="player-card__photo" alt={activePlayer.player} onError={() => setImgErrorActive(true)} />
                    ) : (
                      <div className="player-card__photo-placeholder">👤</div>
                    )}
                  </div>
                  <div className="player-card__info">
                    <PlayerFlag playerKey={activePlayer.player_key} />
                    <span className="player-card__name">{activePlayer.player}</span>
                  </div>
                  {roundPhase === 'result' && (
                    <div className="player-card__wins-reveal animate-pop">
                      {h2hWins.active} {h2hWins.active === 1 ? 'Victoria' : 'Victorias'}
                    </div>
                  )}
                </div>

                <div className="matchup-vs-middle">
                  <div className="vs-badge">VS</div>
                </div>

                {/* Challenger Player Card */}
                <div 
                  className={`player-comparison-card ${roundPhase === 'guessing' ? 'clickable' : ''} 
                    ${roundPhase === 'result' && selectedGuess === 'challenger' ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}
                    ${roundPhase === 'result' && selectedGuess === 'active' && !isCorrect ? 'is-correct-border' : ''}`}
                  onClick={() => handleGuess('challenger')}
                >
                  <div className="player-card__rank">Rank: {challengerPlayer.place || '-'}</div>
                  <div className="player-card__photo-container">
                    {challengerLogo && !imgErrorChallenger ? (
                      <img src={challengerLogo} className="player-card__photo" alt={challengerPlayer.player} onError={() => setImgErrorChallenger(true)} />
                    ) : (
                      <div className="player-card__photo-placeholder">👤</div>
                    )}
                  </div>
                  <div className="player-card__info">
                    <PlayerFlag playerKey={challengerPlayer.player_key} />
                    <span className="player-card__name">{challengerPlayer.player}</span>
                  </div>
                  {roundPhase === 'result' && (
                    <div className="player-card__wins-reveal animate-pop">
                      {h2hWins.challenger} {h2hWins.challenger === 1 ? 'Victoria' : 'Victorias'}
                    </div>
                  )}
                </div>
              </div>

              {roundPhase === 'result' && (
                <div className="round-result-action fade-in">
                  {h2hWins.active === h2hWins.challenger && (
                    <p className="tie-info-text">¡Estaban empatados! ({h2hWins.active} - {h2hWins.challenger}). Tu elección fue marcada como correcta.</p>
                  )}
                  {isCorrect ? (
                    <button className="h2h-btn-action next" onClick={handleNextRound}>
                      Siguiente Ronda ➔
                    </button>
                  ) : (
                    <button className="h2h-btn-action results" onClick={handleShowResults}>
                      Ver Resultados Finales 🏁
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="h2h-modal-overlay">
          <div className="h2h-modal-content scale-in">
            <span className="modal-icon-header">💀</span>
            <h2>¡Fin de la Partida!</h2>
            
            <p className="modal-streak-text">
              Tu racha fue de <span className="text-gold">{streak}</span> aciertos consecutivos.
            </p>

            {activePlayer && challengerPlayer && (
              <div className="modal-final-matchup">
                <h3>El partido que quebró la racha:</h3>
                <div className="modal-matchup-row">
                  <div className="modal-player-col">
                    <span className="modal-player-name">{activePlayer.player.split(' ').pop()}</span>
                    <span className="modal-player-wins">{h2hWins.active}</span>
                  </div>
                  <div className="modal-vs-divider">vs</div>
                  <div className="modal-player-col">
                    <span className="modal-player-wins">{h2hWins.challenger}</span>
                    <span className="modal-player-name">{challengerPlayer.player.split(' ').pop()}</span>
                  </div>
                </div>
                <div className="modal-matchup-sub">
                  Historial total: {h2hWins.totalMatches} partidos disputados.
                </div>
              </div>
            )}

            <div className="modal-footer-stats">
              <span>Tu récord histórico: {Math.max(globalStats.bestStreak, streak)} aciertos</span>
            </div>

            <div className="modal-action-buttons">
              <button className="modal-btn share" onClick={handleShare}>
                Compartir Racha 🚀
              </button>
              <button className="modal-btn replay" onClick={handleRestart}>
                Jugar de Nuevo 🔄
              </button>
              <button className="modal-btn exit" onClick={handleQuitToMenu}>
                Volver al Menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameH2H;
