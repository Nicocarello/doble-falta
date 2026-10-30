import React, { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PlayerFlag from '../components/common/PlayerFlag'
import StatusBadge from '../components/common/StatusBadge'
import { parseSetScore, getMatchStatus, USER_TIMEZONE, parseRound, filterEmptySets } from '../utils/tennisHelpers'
import { fetchFromApi } from '../services/tennisApi'
import { useTennis } from '../context/TennisContext'

const STAT_NAMES_ES = {
  // 🎾 Saque
  'Aces': 'Aces',
  'Double Faults': 'Dobles Faltas',
  '1st serve percentage': '% 1er Saque',
  '1st serve points won': 'Puntos ganados (1er Saque)',
  '2nd serve points won': 'Puntos ganados (2do Saque)',
  'Break Points Saved': 'Break Points Salvados',
  // 🔁 Resto
  '1st return points won': 'Puntos ganados (Resto 1er S.)',
  '2nd return points won': 'Puntos ganados (Resto 2do S.)',
  'Break Points Converted': 'Break Points Convertidos',
  // 📊 Puntos
  'Winners': 'Winners',
  'Unforced errors': 'Errores No Forzados',
  'Net points won': 'Puntos en Red',
  'Service Points Won': 'Total Puntos de Saque',
  'Return Points Won': 'Total Puntos de Resto',
  'Total Points Won': 'Total Puntos Ganados',
  'Last 10 balls': 'Últimas 10 Bolas',
  'Match points saved': 'Match Points Salvados',
  // 🎮 Games
  'Service games won': 'Games de Saque Ganados',
  'Return games won': 'Games de Resto Ganados',
  'Total games won': 'Total Games Ganados',
}

// Convierte "6 (7)" o "75%" a número para la barra de progreso
const toNum = (val) => {
  if (!val) return 0
  const str = String(val).replace('%', '').trim()
  // e.g. "6 (7)" => 6
  const n = parseFloat(str.split(' ')[0])
  return isNaN(n) ? 0 : n
}

const StatBar = ({ label, v1, v2 }) => {
  const n1 = toNum(v1)
  const n2 = toNum(v2)
  const total = n1 + n2
  const pct1 = total === 0 ? 50 : Math.round((n1 / total) * 100)
  const pct2 = 100 - pct1
  const p1Wins = n1 >= n2

  return (
    <div className="stat-row-wrapper">
      <div className="stat-row-values">
        <span className={`stat-val ${p1Wins ? 'stat-val--winner' : ''}`}>{v1 ?? '-'}</span>
        <span className="stat-label-text">{label}</span>
        <span className={`stat-val ${!p1Wins ? 'stat-val--winner' : ''}`}>{v2 ?? '-'}</span>
      </div>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill stat-bar-fill--left"
          style={{ width: `${pct1}%` }}
        />
        <div
          className="stat-bar-fill stat-bar-fill--right"
          style={{ width: `${pct2}%` }}
        />
      </div>
    </div>
  )
}

const MatchDetail = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { playerProfiles, fetchPlayerProfile, rankingMap } = useTennis()
  const [imgErrorP1, setImgErrorP1] = useState(false)
  const [imgErrorP2, setImgErrorP2] = useState(false)

  // Get basic match data from navigation state if available
  const stateMatch = location.state?.match || null

  // ── Fallback fetch when coming from a direct URL (no state) ──────────────
  const { data: fetchedMatch, isLoading: loadingMatch } = useQuery({
    queryKey: ['matchById', matchId],
    queryFn: async () => {
      const today = new Date()
      // Try a ±7-day window around today to find the match
      const dateFrom = new Date(today)
      dateFrom.setDate(dateFrom.getDate() - 7)
      const dateTo = new Date(today)
      dateTo.setDate(dateTo.getDate() + 7)

      const fmt = (d) => d.toISOString().split('T')[0]
      const res = await fetchFromApi('get_fixtures', {
        match_key: matchId,
        date_start: fmt(dateFrom),
        date_stop: fmt(dateTo),
        timezone: USER_TIMEZONE,
      })

      if (res.success !== 1 || !res.result?.length) {
        // If date-range search failed, try just by match_key without dates
        const res2 = await fetchFromApi('get_fixtures', { match_key: matchId, timezone: USER_TIMEZONE })
        if (res2.success !== 1 || !res2.result?.length) return null
        const f = res2.result[0]
        return buildGameObj(f)
      }
      return buildGameObj(res.result[0])
    },
    enabled: !stateMatch, // Only run if we don't have state data
    staleTime: 30_000,
  })

  const buildGameObj = (f) => {
    const gameScore = (f.event_game_result && typeof f.event_game_result === 'string')
      ? f.event_game_result.split(' - ') : ['0', '0']
    const scoresArr = Array.isArray(f.scores) ? f.scores : []
    return {
      id: f.event_key,
      p1Key: f.first_player_key, p2Key: f.second_player_key,
      player1: f.event_first_player, player2: f.event_second_player,
      p1Logo: f.event_first_player_logo, p2Logo: f.event_second_player_logo,
      p1Sets: filterEmptySets(f.scores, getMatchStatus(f)).map(s => s.score_first),
      p2Sets: filterEmptySets(f.scores, getMatchStatus(f)).map(s => s.score_second),
      currentGame: gameScore[0], p2Game: gameScore[1],
      status: getMatchStatus(f), time: f.event_time || '',
      serving: f.event_serve === 'First Player' ? 1 : (f.event_serve === 'Second Player' ? 2 : 0),
      winner: f.event_winner,
      tournament: f.tournament_name || '',
      round: parseRound(f.tournament_round, f.event_qualification === 'True'),
    }
  }

  const match = stateMatch || fetchedMatch || {}
  const isMatchLoading = !stateMatch && loadingMatch

  // Update document title
  React.useEffect(() => {
    if (match.player1 && match.player2) {
      document.title = `${match.player1} vs ${match.player2} - Resultados en Vivo - DobleFalta`;
    } else {
      document.title = 'Ficha del Partido - DobleFalta';
    }
  }, [match.player1, match.player2]);

  // ── H2H ──────────────────────────────────────────────────────────────────
  const { data: h2hData, isLoading: loadingH2H } = useQuery({
    queryKey: ['h2h', match.p1Key, match.p2Key],
    queryFn: async () => {
      const res = await fetchFromApi('get_H2H', {
        first_player_key: match.p1Key,
        second_player_key: match.p2Key,
      })
      if (res.success !== 1 || !res.result?.H2H) return { p1Wins: 0, p2Wins: 0, matches: [] }

      const p1KeyStr = String(match.p1Key)
      const p2KeyStr = String(match.p2Key)

      let p1Wins = 0, p2Wins = 0
      res.result.H2H.forEach(m => {
        // Determine which key won this historical match
        const winnerKey = m.event_winner === 'First Player'
          ? String(m.first_player_key)
          : String(m.second_player_key)

        if (winnerKey === p1KeyStr) p1Wins++
        else if (winnerKey === p2KeyStr) p2Wins++
      })

      return { p1Wins, p2Wins, matches: res.result.H2H.slice(0, 5) }
    },
    enabled: !!match.p1Key && !!match.p2Key,
  })

  // ── Odds ─────────────────────────────────────────────────────────────────
  const { data: oddsData } = useQuery({
    queryKey: ['matchOdds', matchId],
    queryFn: async () => {
      const res = await fetchFromApi('get_odds', { match_key: matchId }).catch(() => ({ success: 0 }))
      if (res.success !== 1 || !res.result?.[matchId]) return null
      const matchOdds = res.result[matchId]['Home/Away'] || {}
      const pick = (side) => {
        const s = matchOdds[side] || {}
        return s.bet365 || s.bwin || s['1xBet'] || s.Betano || Object.values(s)[0] || null
      }
      const isFin = ['FIN', 'RET', 'W/O', 'CANC'].includes(String(match.status || '').toUpperCase())
      if (isFin) return null
      return { p1Odd: pick('Home'), p2Odd: pick('Away') }
    },
    enabled: !!matchId,
  })

  // ── Statistics ────────────────────────────────────────────────────────────
  // Las estadísticas vienen embebidas en get_livescore como array por jugador.
  // Las pivoteamos en pares { stat_name, p1_val, p2_val } para el StatBar.
  const { data: statsData } = useQuery({
    queryKey: ['matchStats', matchId],
    queryFn: async () => {
      const res = await fetchFromApi('get_livescore', { match_key: matchId }).catch(() => ({ success: 0 }))
      if (res.success !== 1 || !res.result?.length) return null

      const matchData = res.result[0]
      const rawStats = Array.isArray(matchData.statistics) ? matchData.statistics : []
      if (rawStats.length === 0) return null

      const p1Key = matchData.first_player_key
      const p2Key = matchData.second_player_key

      // Separar stats por jugador y período 'match'
      const p1Stats = {}, p2Stats = {}
      rawStats.forEach(s => {
        if (s.stat_period !== 'match') return
        if (String(s.player_key) === String(p1Key)) p1Stats[s.stat_name] = s.stat_value
        else if (String(s.player_key) === String(p2Key)) p2Stats[s.stat_name] = s.stat_value
      })

      // Stats seleccionadas para mostrar, en orden
      const ORDER = [
        // Saque
        'Aces', 'Double Faults', '1st serve percentage',
        '1st serve points won', '2nd serve points won', 'Break Points Saved',
        // Resto
        '1st return points won', '2nd return points won', 'Break Points Converted',
        // Puntos
        'Winners', 'Unforced errors', 'Net points won',
        'Service Points Won', 'Return Points Won',
      ]

      const paired = ORDER
        .filter(name => p1Stats[name] !== undefined || p2Stats[name] !== undefined)
        .map(name => ({ name, p1: p1Stats[name] ?? '-', p2: p2Stats[name] ?? '-' }))

      return paired.length > 0 ? paired : null
    },
    enabled: !!matchId,
    refetchInterval: 60_000, // actualiza cada minuto si está en vivo
    staleTime: 30_000,
  })

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderSets = (sets, otherSets) =>
    (sets || []).map((s, i) => {
      const score = parseSetScore(s)
      const otherScore = parseSetScore(otherSets ? otherSets[i] : null)
      const isWinner = parseInt(score.games) > parseInt(otherScore.games)
      return (
        <div key={i} className={`set-box ${isWinner ? 'winner-val' : ''}`}>
          {score.games}
          {score.tb && <span className="tiebreak-val">({score.tb})</span>}
        </div>
      )
    })

  if (isMatchLoading) {
    return (
      <div className="detail-view">
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate(-1)}>← VOLVER</button>
          <div style={{ fontWeight: 900 }}>FICHA DEL PARTIDO</div>
        </div>
        <div style={{ padding: '60px', textAlign: 'center', color: '#aaa' }}>Cargando partido...</div>
      </div>
    )
  }

  if (!match.player1 && !isMatchLoading) {
    return (
      <div className="detail-view">
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate(-1)}>← VOLVER</button>
          <div style={{ fontWeight: 900 }}>FICHA DEL PARTIDO</div>
        </div>
        <div style={{ padding: '60px', textAlign: 'center', color: '#aaa' }}>
          No se encontró información del partido.
        </div>
      </div>
    )
  }

  const p1Logo = match.p1Logo || playerProfiles[match.p1Key]?.logo
  const p2Logo = match.p2Logo || playerProfiles[match.p2Key]?.logo

  return (
    <div className="detail-view">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← VOLVER</button>
        <div style={{ fontWeight: 900 }}>FICHA DEL PARTIDO</div>
      </div>

      <div className="detail-content">
        {/* Tournament badge */}
        <div className="detail-tournament" style={{ whiteSpace: 'pre-line' }}>
          {match.tournament || 'Torneo'} {match.round && <span className="detail-round">— {match.round}</span>}
        </div>

        {/* Score card */}
        <div className="detail-players-container">
          {/* Player 1 */}
          <div className="detail-player-row">
            <div 
              className={`detail-player-name ${match.winner === 'First Player' ? 'winner' : ''}`}
              onClick={() => match.p1Key && navigate(`/jugador/${match.p1Key}`)}
              style={{ cursor: match.p1Key ? 'pointer' : 'default' }}
            >
              <PlayerFlag playerKey={match.p1Key} />
              <span style={{ marginLeft: 6 }}>{match.player1}</span>
              {match.winner === 'First Player' && <span style={{ marginLeft: '6px', fontSize: '1.2rem' }}>✅</span>}
              {rankingMap[match.p1Key] && (
                <span className="player-rank" style={{ marginLeft: 8 }}>
                  ({rankingMap[match.p1Key]})
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="score-sequence">
                {renderSets(match.p1Sets, match.p2Sets)}
                {match.status === 'LIVE' && (
                  <div className="game-point-box">{match.currentGame}</div>
                )}
              </div>
              {oddsData?.p1Odd && (
                <div className="odd-value" style={{ marginLeft: 8, padding: '4px 10px', fontSize: '0.9rem' }}>
                  {oddsData.p1Odd}
                </div>
              )}
            </div>
          </div>

          {/* Player 2 */}
          <div className="detail-player-row">
            <div 
              className={`detail-player-name ${match.winner === 'Second Player' ? 'winner' : ''}`}
              onClick={() => match.p2Key && navigate(`/jugador/${match.p2Key}`)}
              style={{ cursor: match.p2Key ? 'pointer' : 'default' }}
            >
              <PlayerFlag playerKey={match.p2Key} />
              <span style={{ marginLeft: 6 }}>{match.player2}</span>
              {match.winner === 'Second Player' && <span style={{ marginLeft: '6px', fontSize: '1.2rem' }}>✅</span>}
              {rankingMap[match.p2Key] && (
                <span className="player-rank" style={{ marginLeft: 8 }}>
                  ({rankingMap[match.p2Key]})
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="score-sequence">
                {renderSets(match.p2Sets, match.p1Sets)}
                {match.status === 'LIVE' && (
                  <div className="game-point-box">{match.p2Game}</div>
                )}
              </div>
              {oddsData?.p2Odd && (
                <div className="odd-value" style={{ marginLeft: 8, padding: '4px 10px', fontSize: '0.9rem' }}>
                  {oddsData.p2Odd}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          {match.status && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <StatusBadge status={match.status} time={match.time} />
            </div>
          )}
        </div>

        {/* ── Statistics ─────────────────────────────────────────────── */}
        {statsData && statsData.length > 0 && (
          <div className="stats-section">
            <div className="stats-title">📊 ESTADÍSTICAS DEL PARTIDO</div>
            <div className="stats-player-names">
              <span>{(match.player1 || '').split(' ').pop()}</span>
              <span>{(match.player2 || '').split(' ').pop()}</span>
            </div>
            <div className="stats-bars-list">
              {statsData.map((stat) => (
                <StatBar
                  key={stat.name}
                  label={STAT_NAMES_ES[stat.name] || stat.name}
                  v1={stat.p1}
                  v2={stat.p2}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── H2H ────────────────────────────────────────────────────── */}
        <div className="detail-h2h-box">
          <div className="detail-h2h-title">HISTORIAL (H2H)</div>
          <div className="h2h-rich-container">
            <div 
              className="h2h-player-card" 
              onClick={() => match.p1Key && navigate(`/jugador/${match.p1Key}`)}
              style={{ cursor: match.p1Key ? 'pointer' : 'default' }}
            >
              <div className="h2h-player-img-wrapper" style={{ transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='none'}>
                {p1Logo && !imgErrorP1
                  ? <img src={p1Logo} className="h2h-player-img" alt="" onError={() => setImgErrorP1(true)} />
                  : <div className="h2h-player-placeholder">?</div>
                }
              </div>
              <div className="h2h-player-nick" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--ball-yellow)'} onMouseOut={e => e.currentTarget.style.color=''}>{(match.player1 || '').split(' ').pop()}</div>
              <div className="h2h-player-meta">
                <span>Rank: {rankingMap[match.p1Key] || '-'}</span>
              </div>
            </div>

            {/* Score */}
            <div className="h2h-center-score">
              {loadingH2H ? (
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Consultando...</div>
              ) : (
                <>
                  <div className="h2h-main-score">{h2hData?.p1Wins} - {h2hData?.p2Wins}</div>
                  <div className="h2h-wins-label">Victorias H2H</div>
                </>
              )}
            </div>

            <div 
              className="h2h-player-card"
              onClick={() => match.p2Key && navigate(`/jugador/${match.p2Key}`)}
              style={{ cursor: match.p2Key ? 'pointer' : 'default' }}
            >
              <div className="h2h-player-img-wrapper" style={{ transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='none'}>
                {p2Logo && !imgErrorP2
                  ? <img src={p2Logo} className="h2h-player-img" alt="" onError={() => setImgErrorP2(true)} />
                  : <div className="h2h-player-placeholder">?</div>
                }
              </div>
              <div className="h2h-player-nick" style={{ transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--ball-yellow)'} onMouseOut={e => e.currentTarget.style.color=''}>{(match.player2 || '').split(' ').pop()}</div>
              <div className="h2h-player-meta">
                <span>Rank: {rankingMap[match.p2Key] || '-'}</span>
              </div>
            </div>
          </div>

          {/* H2H recent matches */}
          {h2hData?.matches?.length > 0 && (
            <div className="h2h-recent">
              <div className="h2h-recent-title">Últimos enfrentamientos</div>
              {h2hData.matches.map((m, i) => {
                // Identify winner by player key, not by position in this historical match
                const winnerKey = m.event_winner === 'First Player'
                  ? String(m.first_player_key)
                  : String(m.second_player_key)
                const firstWon  = winnerKey === String(m.first_player_key)
                return (
                  <div key={i} className="h2h-recent-row">
                    <span className="h2h-recent-date">{m.event_date?.slice(0, 4)}</span>
                    <span className={`h2h-recent-player ${firstWon ? 'h2h-recent-player--winner' : ''}`}>
                      {m.event_first_player?.split(' ').pop()}
                    </span>
                    <span className="h2h-recent-score">{m.event_final_result || '-'}</span>
                    <span className={`h2h-recent-player ${!firstWon ? 'h2h-recent-player--winner' : ''}`}>
                      {m.event_second_player?.split(' ').pop()}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MatchDetail
