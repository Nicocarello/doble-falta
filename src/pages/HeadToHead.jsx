import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchFromApi } from '../services/tennisApi';
import { useTennis } from '../context/TennisContext';
import PlayerFlag from '../components/common/PlayerFlag';
import './HeadToHead.css';

const normalizeString = (str) => {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const PlayerSearch = ({ label, selectedPlayer, onSelect, onClear, allPlayers }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) {
      const normQuery = normalizeString(val);
      const filtered = allPlayers
        .filter(p => normalizeString(p.name).includes(normQuery))
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  if (selectedPlayer) {
    return (
      <div className="h2h-search-box">
        <div className="h2h-selected-player">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
            <strong>{selectedPlayer.name}</strong>
          </div>
          <button className="h2h-clear-btn" onClick={onClear}>Cambiar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h2h-search-box" ref={wrapperRef}>
      <label>{label}</label>
      <input
        type="text"
        placeholder="Escribe el nombre..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => { if (query.length >= 2) setShowSuggestions(true); }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="h2h-suggestions">
          {suggestions.map((p, i) => (
            <li key={`${p.key}-${i}`} onClick={() => {
              onSelect(p);
              setQuery('');
              setShowSuggestions(false);
            }}>
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const HeadToHead = () => {
  const navigate = useNavigate();
  const { atpRankings, wtaRankings, rankingMap, playerProfiles, fetchPlayerProfile } = useTennis();
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [imgErrorP1, setImgErrorP1] = useState(false);
  const [imgErrorP2, setImgErrorP2] = useState(false);

  useEffect(() => {
    if (player1?.key) fetchPlayerProfile(player1.key);
    if (player2?.key) fetchPlayerProfile(player2.key);
  }, [player1, player2, fetchPlayerProfile]);

  // Derive active players array
  const activePlayers = React.useMemo(() => {
    const map = new Map();
    [...atpRankings, ...wtaRankings].forEach(r => {
      if (r.player_key && r.player && !map.has(r.player_key)) {
        map.set(r.player_key, { key: r.player_key, name: r.player, rank: r.place });
      }
    });
    return Array.from(map.values());
  }, [atpRankings, wtaRankings]);

  // H2H Query
  const { data: h2hData, isLoading, error } = useQuery({
    queryKey: ['h2h_custom', player1?.key, player2?.key],
    queryFn: async () => {
      const res = await fetchFromApi('get_H2H', {
        first_player_key: player1.key,
        second_player_key: player2.key,
      });
      
      if (res.success !== 1 || !res.result?.H2H) {
        return { p1Wins: 0, p2Wins: 0, matches: [] };
      }

      const p1KeyStr = String(player1.key);
      const p2KeyStr = String(player2.key);

      let p1Wins = 0, p2Wins = 0;
      res.result.H2H.forEach(m => {
        const winnerKey = m.event_winner === 'First Player'
          ? String(m.first_player_key)
          : String(m.second_player_key);

        if (winnerKey === p1KeyStr) p1Wins++;
        else if (winnerKey === p2KeyStr) p2Wins++;
      });

      return { p1Wins, p2Wins, matches: res.result.H2H };
    },
    enabled: !!(player1 && player2),
  });

  const p1Logo = playerProfiles[player1?.key]?.logo;
  const p2Logo = playerProfiles[player2?.key]?.logo;

  return (
    <div className="h2h-page fade-in">
      <div className="h2h-header">
        <h1>📊 Frente a Frente (H2H)</h1>
        <p>Compara el historial entre dos jugadores del circuito.</p>
      </div>

      <div className="h2h-inputs-container">
        <PlayerSearch
          label="Jugador 1"
          selectedPlayer={player1}
          onSelect={setPlayer1}
          onClear={() => setPlayer1(null)}
          allPlayers={activePlayers}
        />
        <div className="h2h-vs-badge">VS</div>
        <PlayerSearch
          label="Jugador 2"
          selectedPlayer={player2}
          onSelect={setPlayer2}
          onClear={() => setPlayer2(null)}
          allPlayers={activePlayers}
        />
      </div>

      {player1 && player2 && (
        <div className="h2h-results-panel">
          {isLoading ? (
            <div className="h2h-loading">Consultando historial...</div>
          ) : error ? (
            <div className="h2h-loading">Ocurrió un error al buscar el historial.</div>
          ) : (
            <>
              {/* Score header */}
              <div className="h2h-score-board">
                <div 
                  className="h2h-player-summary"
                  onClick={() => navigate(`/jugador/${player1.key}`)}
                >
                  <div className="h2h-photo-wrapper">
                    {p1Logo && !imgErrorP1 ? (
                      <img src={p1Logo} className="h2h-photo" alt={player1.name} onError={() => setImgErrorP1(true)} />
                    ) : (
                      <div className="h2h-photo-placeholder">👤</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlayerFlag playerKey={player1.key} />
                    <div className="h2h-player-summary-name">{player1.name.split(' ').pop()}</div>
                  </div>
                  <div className="h2h-player-summary-rank">Rank: {player1.rank}</div>
                </div>

                <div className="h2h-score-center">
                  <div className="h2h-score-numbers">
                    <span className={h2hData.p1Wins > h2hData.p2Wins ? 'winner-text' : ''}>{h2hData.p1Wins}</span>
                    <span>-</span>
                    <span className={h2hData.p2Wins > h2hData.p1Wins ? 'winner-text' : ''}>{h2hData.p2Wins}</span>
                  </div>
                  <div className="h2h-score-label">Victorias</div>
                </div>

                <div 
                  className="h2h-player-summary"
                  onClick={() => navigate(`/jugador/${player2.key}`)}
                >
                  <div className="h2h-photo-wrapper">
                    {p2Logo && !imgErrorP2 ? (
                      <img src={p2Logo} className="h2h-photo" alt={player2.name} onError={() => setImgErrorP2(true)} />
                    ) : (
                      <div className="h2h-photo-placeholder">👤</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlayerFlag playerKey={player2.key} />
                    <div className="h2h-player-summary-name">{player2.name.split(' ').pop()}</div>
                  </div>
                  <div className="h2h-player-summary-rank">Rank: {player2.rank}</div>
                </div>
              </div>

              {/* Match list */}
              {h2hData.matches.length > 0 ? (
                <div className="h2h-matches-list">
                  <h3>Partidos Previos ({h2hData.matches.length})</h3>
                  {h2hData.matches.map((m, i) => {
                    const firstWon = m.event_winner === 'First Player';
                    return (
                      <div key={i} className="h2h-match-row">
                        <div className="h2h-match-date">{m.event_date?.split(' ')[0]}</div>
                        <div className="h2h-match-tourney">{m.tournament_name || 'Torneo'}</div>
                        <div className="h2h-match-players">
                          <span className={firstWon ? 'winner-text' : ''}>
                            {m.event_first_player}
                          </span>
                          <span style={{ margin: '0 10px', color: '#555' }}>|</span>
                          <span className={!firstWon ? 'winner-text' : ''}>
                            {m.event_second_player}
                          </span>
                        </div>
                        <div className="h2h-match-score">{m.event_final_result}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h2h-no-matches">
                  No hay enfrentamientos previos registrados entre estos jugadores.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HeadToHead;
