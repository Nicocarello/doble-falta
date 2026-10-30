import React, { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import StatusBadge from '../components/common/StatusBadge'
import PlayerFlag from '../components/common/PlayerFlag'
import { getMatchStatus, parseRound, parseSetScore, USER_TIMEZONE, filterEmptySets } from '../utils/tennisHelpers'
import { fetchFromApi } from '../services/tennisApi'
import { useTennis } from '../context/TennisContext'
import { MASTER_TOURNAMENTS } from '../constants/tennis'
import ErrorBoundary from '../components/common/ErrorBoundary'
import SEO from '../components/common/SEO'

const TournamentDetailComponent = () => {
  const { categoryId, tournamentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { rankingMap } = useTennis()

  const dynamicTournament = location.state?.dynamicTournament
  const selectedTournament = MASTER_TOURNAMENTS[categoryId]?.find(t => t.id === tournamentId) || dynamicTournament || {}

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('list');
  const [zoom, setZoom] = useState(1);
  const bracketWrapperRef = React.useRef(null);

  React.useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        setZoom(prev => Math.max(0.5, Math.min(1.5, prev + delta)));
      }
    };

    const wrapper = bracketWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (wrapper) {
        wrapper.removeEventListener('wheel', handleWheel);
      }
    };
  }, [viewMode]);

  const seoTitle = selectedTournament.name ? `${selectedTournament.name} ${selectedYear} - Cuadro y Resultados` : 'Información del Torneo';
  const seoDescription = selectedTournament.name ? `Sigue el ${selectedTournament.name} ${selectedYear} en vivo. Resultados actualizados, cuadro principal del torneo de tenis en ${selectedTournament.city} (${selectedTournament.surface}).` : 'Información detallada sobre torneos del circuito profesional de tenis.';
  const seoKeywords = `${selectedTournament.name || 'tenis'}, resultados tenis, cuadro tenis, ${selectedTournament.surface || ''}, ${selectedTournament.city || ''}`;

  const { data, isLoading } = useQuery({
    queryKey: ['tournamentFixtures', tournamentId, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      let res = await fetchFromApi('get_fixtures', { tournament_key: selectedTournament.apiKey, date_start: startDate, date_stop: endDate, timezone: USER_TIMEZONE });

      if (selectedYear === new Date().getFullYear() && (res.success !== 1 || !res.result || !res.result.length)) {
        const lastYear = selectedYear - 1;
        const startPrev = `${lastYear}-01-01`;
        const endPrev = `${lastYear}-12-31`;
        const prevRes = await fetchFromApi('get_fixtures', { tournament_key: selectedTournament.apiKey, date_start: startPrev, date_stop: endPrev, timezone: USER_TIMEZONE });
        
        if (prevRes.success === 1 && Array.isArray(prevRes.result) && prevRes.result.length > 0) {
          return { year: lastYear, items: prevRes.result.filter(m => m.event_qualification !== 'True') };
        }
      }
      return { year: selectedYear, items: (res.success === 1 && Array.isArray(res.result)) ? res.result.filter(m => m.event_qualification !== 'True') : [] };
    },
    enabled: !!selectedTournament.apiKey
  });

  React.useEffect(() => {
    if (data?.year && data.year !== selectedYear) {
      setSelectedYear(data.year);
    }
  }, [data?.year, selectedYear]);

  const fixtures = data?.items || [];
  const currentYear = new Date().getFullYear();
  const minYear = 2022; // La API solo garantiza historial de fixtures de 2022 en adelante
  const yearsOptions = Array.from({ length: currentYear - minYear + 1 }, (_, i) => currentYear - i);

  const hasRoundRobin = fixtures.some(f => (f.tournament_round || '').toLowerCase().includes('round robin'));

  const getRoundLevel = (roundStr) => {
    const s = (roundStr || '').toLowerCase();
    if (s.includes('1/64') || s.includes('1st round') || s.includes('round 1') || s.includes('1ra ronda')) return 6;
    if (s.includes('1/32') || s.includes('2nd round') || s.includes('round 2') || s.includes('2da ronda')) return 5;
    if (s.includes('1/16') || s.includes('3rd round') || s.includes('round 3') || s.includes('3ra ronda')) return 4;
    if (s.includes('1/8') || s.includes('4th round') || s.includes('round 4') || s.includes('4ta ronda') || s.includes('8vos')) return 3;
    if (s.includes('quarter') || s.includes('1/4') || s.includes('4tos')) return 2;
    if (s.includes('semi')) return 1;
    if (s.includes('final')) return 0;
    return -1;
  };

  const getRoundHeader = (level, maxLevel) => {
    const diff = maxLevel - level;
    if (level === 0) return 'Final';
    if (level === 1) return 'Semifinal';
    if (level === 2) return 'Cuartos de Final';
    if (level === 3) return 'Octavos de Final';
    return `${diff + 1}ª Ronda`;
  };

  const buildBracketTree = () => {
    if (!fixtures || fixtures.length === 0) return null;

    // Filter main draw fixtures (excluding qualification and cancelled matches)
    const mainDraw = fixtures.filter(
      f => f.event_qualification !== 'True' && f.event_status !== 'Cancelled'
    );

    // Group matches by level
    const matchesByLevel = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    mainDraw.forEach(m => {
      const lvl = getRoundLevel(m.tournament_round);
      if (lvl >= 0 && lvl <= 6) {
        matchesByLevel[lvl].push(m);
      }
    });

    // Find the minLevel and maxLevel present in the API
    const levelsPresent = Object.keys(matchesByLevel)
      .map(Number)
      .filter(lvl => matchesByLevel[lvl].length > 0);

    if (levelsPresent.length === 0) return null;

    const maxLevel = Math.max(...levelsPresent);
    const minLevel = Math.min(...levelsPresent);

    // Base matches list at minLevel sorted by event_key to keep consistency
    const minLevelMatches = [...matchesByLevel[minLevel]].sort(
      (a, b) => (a.event_key || 0) - (b.event_key || 0)
    );

    // Find a match containing a specific player (by key first, then name)
    const findMatchForPlayer = (level, playerName, playerKey) => {
      if (!playerName && !playerKey) return null;
      for (const m of matchesByLevel[level]) {
        const p1Key = m.first_player_key;
        const p2Key = m.second_player_key;
        const p1Name = m.event_first_player;
        const p2Name = m.event_second_player;

        if (playerKey) {
          if (p1Key === playerKey || p2Key === playerKey) return m;
        }
        if (playerName) {
          const pLower = playerName.toLowerCase();
          if (
            (p1Name && pLower === p1Name.toLowerCase()) ||
            (p2Name && pLower === p2Name.toLowerCase())
          ) {
            return m;
          }
        }
      }
      return null;
    };

    // Helper to get winner label of a node
    const getWinnerOfNode = (n) => {
      if (!n) return 'TBD';
      if (n.match) {
        if (n.match.event_winner === 'First Player') return n.match.event_first_player;
        if (n.match.event_winner === 'Second Player') return n.match.event_second_player;
        return `${n.match.event_first_player || 'TBD'} / ${n.match.event_second_player || 'TBD'}`;
      }
      const w1 = n.feeder1 ? getWinnerOfNode(n.feeder1) : 'TBD';
      const w2 = n.feeder2 ? getWinnerOfNode(n.feeder2) : 'TBD';
      if (w1 === 'TBD' && w2 === 'TBD') return 'TBD';
      return `${w1} / ${w2}`;
    };

    // Recursive tree builder
    const buildNode = (level, match = null, subMatches = null, playerHint = null, playerKeyHint = null) => {
      const node = {
        level,
        match,
        player1: match ? match.event_first_player : playerHint,
        player2: match ? match.event_second_player : null,
        p1Key: match ? match.first_player_key : playerKeyHint,
        p2Key: match ? match.second_player_key : null,
        feeder1: null,
        feeder2: null
      };

      if (level === maxLevel) {
        return node;
      }

      // Tracing feeder nodes at level + 1
      if (level < minLevel) {
        // Above minLevel: partition the subMatches array of the minLevel
        const currentSub = subMatches || minLevelMatches;
        const mid = Math.floor(currentSub.length / 2);
        const leftSub = currentSub.slice(0, mid);
        const rightSub = currentSub.slice(mid);

        const f1Match = (leftSub.length === 1 && level + 1 === minLevel) ? leftSub[0] : null;
        const f2Match = (rightSub.length === 1 && level + 1 === minLevel) ? rightSub[0] : null;

        node.feeder1 = buildNode(level + 1, f1Match, leftSub);
        node.feeder2 = buildNode(level + 1, f2Match, rightSub);

        // Populate player hints for virtual match
        node.player1 = getWinnerOfNode(node.feeder1);
        node.player2 = getWinnerOfNode(node.feeder2);
        node.p1Key = node.feeder1.match ? (node.feeder1.match.event_winner === 'Second Player' ? node.feeder1.p2Key : node.feeder1.p1Key) : null;
        node.p2Key = node.feeder2.match ? (node.feeder2.match.event_winner === 'Second Player' ? node.feeder2.p2Key : node.feeder2.p1Key) : null;
      } else {
        // Below or equal to minLevel: trace by player names / keys
        if (match) {
          const p1Name = match.event_first_player;
          const p1Key = match.first_player_key;
          const p2Name = match.event_second_player;
          const p2Key = match.second_player_key;

          const f1Match = findMatchForPlayer(level + 1, p1Name, p1Key);
          const f2Match = findMatchForPlayer(level + 1, p2Name, p2Key);

          node.feeder1 = buildNode(level + 1, f1Match, null, p1Name, p1Key);
          node.feeder2 = buildNode(level + 1, f2Match, null, p2Name, p2Key);
        } else {
          // Virtual feeder path (fallback)
          node.feeder1 = buildNode(level + 1, null, null, node.player1, node.p1Key);
          node.feeder2 = buildNode(level + 1, null, null, node.player2, node.p2Key);
        }
      }

      return node;
    };

    const finalMatch = matchesByLevel[0].length > 0 ? matchesByLevel[0][0] : null;
    const rootNode = buildNode(0, finalMatch);

    // Collect columns
    const columns = Array.from({ length: maxLevel + 1 }, () => []);
    const collect = (node) => {
      if (!node) return;
      columns[node.level].push(node);
      collect(node.feeder1);
      collect(node.feeder2);
    };
    collect(rootNode);

    return { columns, maxLevel };
  };

  const bracketData = !hasRoundRobin ? buildBracketTree() : null;

  const renderBracket = () => {
    if (!bracketData || !bracketData.columns) return null;
    const { columns, maxLevel } = bracketData;
    
    // Calculate vertical height of the columns container based on first round size
    const containerHeight = Math.max(600, (2 ** maxLevel) * 70);

    return (
      <div 
        ref={bracketWrapperRef}
        className="bracket-outer-wrapper"
        style={{ position: 'relative' }}
      >
        {/* Floating Zoom Controls */}
        <div className="bracket-zoom-controls">
          <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} title="Zoom Out">-</button>
          <button onClick={() => setZoom(1)} title="Restablecer">{Math.round(zoom * 100)}%</button>
          <button onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))} title="Zoom In">+</button>
        </div>

        <div 
          className="bracket-columns-container" 
          style={{ 
            height: `${containerHeight}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.1s ease-out'
          }}
        >
          {columns.slice().reverse().map((columnMatches, idx) => {
            // Since we reversed, the levels go from maxLevel down to 0
            const currentLevel = maxLevel - idx;
            const roundHeader = getRoundHeader(currentLevel, maxLevel);
            
            return (
              <div key={currentLevel} className="bracket-column">
                <div className="bracket-column-header">{roundHeader}</div>
                {columnMatches.map((node, matchIdx) => {
                  const m = node.match;
                  const p1Name = node.player1 || 'TBD';
                  const p2Name = node.player2 || 'TBD';
                  const p1Key = node.p1Key;
                  const p2Key = node.p2Key;
                  
                  const isVirtual = !m;
                  const status = isVirtual ? '' : getMatchStatus(m);
                  const isFinished = ['FIN', 'RET', 'W/O', 'CANC'].includes(status);
                  
                  const p1Winner = m && m.event_winner === 'First Player';
                  const p2Winner = m && m.event_winner === 'Second Player';
                  
                  const scoresArr = m && Array.isArray(m.scores) ? m.scores : [];
                  const activeSets = m ? filterEmptySets(m.scores, status) : [];
                  const isLive = status === 'LIVE';

                  return (
                    <div 
                      key={matchIdx}
                      className={`bracket-match-card ${isLive ? 'live-border' : ''} ${isVirtual ? 'virtual-card' : ''}`}
                      onClick={() => {
                        if (isVirtual || !m) return;
                        const gameScore = (m.event_game_result && typeof m.event_game_result === 'string') ? m.event_game_result.split(' - ') : ['0', '0'];
                        const gameObj = {
                          id: m.event_key, p1Key: m.first_player_key, p2Key: m.second_player_key,
                          player1: m.event_first_player, player2: m.event_second_player,
                          p1Logo: m.event_first_player_logo, p2Logo: m.event_second_player_logo,
                          p1Sets: scoresArr.map(s => s.score_first),
                          p2Sets: scoresArr.map(s => s.score_second),
                          currentGame: gameScore[0], p2Game: gameScore[1],
                          status: status, time: m.event_time || '',
                          serving: m.event_serve === 'First Player' ? 1 : (m.event_serve === 'Second Player' ? 2 : 0),
                          winner: m.event_winner,
                          round: parseRound(m.tournament_round, m.event_qualification === 'True'), 
                          tournament: selectedTournament.name
                        };
                        navigate(`/match/${m.event_key}`, { state: { match: gameObj } });
                      }}
                      style={{ cursor: isVirtual ? 'default' : 'pointer' }}
                    >
                      <div className="bracket-player-row">
                        <div className="bracket-player-info">
                          {!isVirtual && p1Key && <PlayerFlag playerKey={p1Key} />}
                          <span className={`bracket-player-name ${p1Winner ? 'winner-name' : ''} ${isFinished && !p1Winner ? 'loser-name' : ''}`}>
                            {p1Name}
                          </span>
                          {rankingMap[p1Key] && <span className="bracket-player-rank">({rankingMap[p1Key]})</span>}
                          {m && m.event_serve === 'First Player' && <span className="serving-dot"></span>}
                        </div>
                        <div className="bracket-scores">
                          {activeSets.map((set, setIdx) => {
                            const score = parseSetScore(set.score_first);
                            const otherScore = parseSetScore(set.score_second);
                            const isSetWinner = parseInt(score.games) > parseInt(otherScore.games);
                            return (
                              <span key={setIdx} className={`bracket-set-box ${isSetWinner ? 'winner-set' : ''}`}>
                                {score.games}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="bracket-player-row">
                        <div className="bracket-player-info">
                          {!isVirtual && p2Key && <PlayerFlag playerKey={p2Key} />}
                          <span className={`bracket-player-name ${p2Winner ? 'winner-name' : ''} ${isFinished && !p2Winner ? 'loser-name' : ''}`}>
                            {p2Name}
                          </span>
                          {rankingMap[p2Key] && <span className="bracket-player-rank">({rankingMap[p2Key]})</span>}
                          {m && m.event_serve === 'Second Player' && <span className="serving-dot"></span>}
                        </div>
                        <div className="bracket-scores">
                          {activeSets.map((set, setIdx) => {
                            const score = parseSetScore(set.score_second);
                            const otherScore = parseSetScore(set.score_first);
                            const isSetWinner = parseInt(score.games) > parseInt(otherScore.games);
                            return (
                              <span key={setIdx} className={`bracket-set-box ${isSetWinner ? 'winner-set' : ''}`}>
                                {score.games}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      
                      {isLive && <div className="bracket-live-tag">LIV</div>}
                      {!isVirtual && m.event_time && !isFinished && !isLive && (
                        <div className="bracket-time-tag">{m.event_time}</div>
                      )}

                      {/* Left Connector Line (Incoming) */}
                      {currentLevel !== maxLevel && (
                        <div className="bracket-connector-left" />
                      )}

                      {/* Right Connector Line (Outgoing split path) */}
                      {currentLevel !== 0 && (
                        <div 
                          className={`bracket-connector-right ${matchIdx % 2 === 0 ? 'connector-down' : 'connector-up'}`}
                          style={{
                            height: `${containerHeight / (2 ** (currentLevel + 1))}px`,
                            top: matchIdx % 2 === 0 ? '50%' : 'auto',
                            bottom: matchIdx % 2 === 0 ? 'auto' : '50%',
                            width: '15px',
                            right: '-15px'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="tournament-detail-view">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={`/tournament/${categoryId}/${tournamentId}`}
      />
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← VOLVER</button>
        <div style={{ fontWeight: 900 }}>INFORMACIÓN DEL TORNEO</div>
      </div>
      <div className="tournament-detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div className="tournament-detail-title">
            {selectedTournament.name}
            <span style={{ fontSize: '1.2rem', color: 'var(--clay-orange)', marginLeft: '15px' }}>{selectedYear}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', color: '#999', fontWeight: 600 }}>EDICIÓN:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {yearsOptions.map(y => (
                <option key={y} value={y} style={{ background: '#222', color: 'white' }}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="tournament-info-bar" style={{ marginTop: '20px' }}>
          <div className="info-pill"><span>Sede:</span> {selectedTournament.city}</div>
          <div className="info-pill"><span>Superficie:</span> {selectedTournament.surface}</div>
          <div className="info-pill"><span>Fecha:</span> {selectedTournament.duration}</div>
        </div>

        {!isLoading && fixtures.length > 0 && !hasRoundRobin && (
          <div className="view-toggle-bar" style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
            <button 
              className={`main-header-block_button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              LISTA DE PARTIDOS
            </button>
            <button 
              className={`main-header-block_button ${viewMode === 'bracket' ? 'active' : ''}`}
              onClick={() => setViewMode('bracket')}
            >
              VER CUADRO
            </button>
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          {isLoading ? <div style={{ textAlign: 'center', padding: '20px' }}>Cargando...</div> :
            fixtures.length > 0 ? (
              viewMode === 'bracket' && !hasRoundRobin ? (
                renderBracket()
              ) : (
                <div className="draw-container">
                  {/* Simplified grouping logic */}
                  {Object.entries(fixtures.reduce((acc, f) => {
                    const r = parseRound(f.tournament_round, f.event_qualification === 'True') || 'Otros';
                    if (!acc[r]) acc[r] = []; acc[r].push(f); return acc;
                  }, {}))
                    .sort((a, b) => {
                      const maxA = Math.max(...a[1].map(m => new Date(`${m.event_date}T${m.event_time || '00:00'}`).getTime() || 0));
                      const maxB = Math.max(...b[1].map(m => new Date(`${m.event_date}T${m.event_time || '00:00'}`).getTime() || 0));
                      return maxB - maxA;
                    })
                    .map(([round, games]) => (
                      <div key={round} className="draw-round-section">
                        <div className="draw-round-title">{round}</div>
                        <div className="games-list">
                          {games.map(f => (
                            <div key={f.event_key} className="match-row" onClick={() => {
                              const gameScore = (f.event_game_result && typeof f.event_game_result === 'string') ? f.event_game_result.split(' - ') : ['0', '0'];
                              const scoresArr = Array.isArray(f.scores) ? f.scores : [];
                              const gameObj = {
                                id: f.event_key, p1Key: f.first_player_key, p2Key: f.second_player_key,
                                player1: f.event_first_player, player2: f.event_second_player,
                                p1Logo: f.event_first_player_logo, p2Logo: f.event_second_player_logo,
                                p1Sets: scoresArr.map(s => s.score_first),
                                p2Sets: scoresArr.map(s => s.score_second),
                                currentGame: gameScore[0], p2Game: gameScore[1],
                                status: getMatchStatus(f), time: f.event_time || '',
                                serving: f.event_serve === 'First Player' ? 1 : (f.event_serve === 'Second Player' ? 2 : 0),
                                winner: f.event_winner,
                                round: parseRound(f.tournament_round, f.event_qualification === 'True'), tournament: selectedTournament.name
                              };
                              navigate(`/match/${f.event_key}`, { state: { match: gameObj } })
                            }}>
                              <div className="status-cell"><StatusBadge status={getMatchStatus(f)} time={f.event_time} /></div>
                              <div className="match-content">
                                <div className="player-row">
                                  <div className={`player-name ${f.event_serve === 'First Player' ? 'serving' : ''} ${f.event_winner === 'First Player' ? 'winner' : ''}`}>
                                    <PlayerFlag playerKey={f.first_player_key} />
                                    {f.event_first_player} {f.event_winner === 'First Player' && <span style={{ marginLeft: '4px', fontSize: '0.9rem' }}>✅</span>} {rankingMap[f.first_player_key] && <span className="player-rank">({rankingMap[f.first_player_key]})</span>}
                                  </div>
                                  <div className="score-sequence">
                                    {filterEmptySets(f.scores, getMatchStatus(f)).map((set, idx) => {
                                      const score = parseSetScore(set.score_first);
                                      const otherScore = parseSetScore(set.score_second);
                                      const isWinner = parseInt(score.games) > parseInt(otherScore.games);
                                      return (
                                        <div key={idx} className={`set-box ${isWinner ? 'winner-val' : ''}`}>
                                          {score.games}{score.tb && <span className="tiebreak-val">({score.tb})</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="player-row">
                                  <div className={`player-name ${f.event_serve === 'Second Player' ? 'serving' : ''} ${f.event_winner === 'Second Player' ? 'winner' : ''}`}>
                                    <PlayerFlag playerKey={f.second_player_key} />
                                    {f.event_second_player} {f.event_winner === 'Second Player' && <span style={{ marginLeft: '4px', fontSize: '0.9rem' }}>✅</span>} {rankingMap[f.second_player_key] && <span className="player-rank">({rankingMap[f.second_player_key]})</span>}
                                  </div>
                                  <div className="score-sequence">
                                    {filterEmptySets(f.scores, getMatchStatus(f)).map((set, idx) => {
                                      const score = parseSetScore(set.score_second);
                                      const otherScore = parseSetScore(set.score_first);
                                      const isWinner = parseInt(score.games) > parseInt(otherScore.games);
                                      return (
                                        <div key={idx} className={`set-box ${isWinner ? 'winner-val' : ''}`}>
                                          {score.games}{score.tb && <span className="tiebreak-val">({score.tb})</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )
            ) : <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Sin datos disponibles.</div>}
        </div>
      </div>
    </div>
  )
}

const TournamentDetail = () => (
  <ErrorBoundary>
    <TournamentDetailComponent />
  </ErrorBoundary>
)

export default TournamentDetail
