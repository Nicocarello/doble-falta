import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTennis } from '../context/TennisContext'
import { fetchFromApi } from '../services/tennisApi'
import { isJuniorMatch } from '../utils/tennisHelpers'
import PlayerFlag from '../components/common/PlayerFlag'
import SEO from '../components/common/SEO'
import '../components/common/SkeletonLoader.css'
import './LiveRanking.css'

// ─── Points Tables (ATP, Challenger, ITF) ─────────────────────────
const POINTS_TABLE = {
  'Grand Slam':     { W: 2000, F: 1200, SF: 720,  QF: 360, R16: 180, R32: 90,  R64: 45, R128: 10 },
  'Masters 1000':   { W: 1000, F: 600,  SF: 360,  QF: 180, R16: 90,  R32: 45,  R64: 10 },
  'ATP 500':        { W: 500,  F: 300,  SF: 180,  QF: 90,  R16: 45,  R32: 20 },
  'ATP 250':        { W: 250,  F: 150,  SF: 90,   QF: 45,  R16: 20,  R32: 5 },
  'Challenger 175': { W: 175,  F: 105,  SF: 63,   QF: 33,  R16: 15,  R32: 1 },
  'Challenger 125': { W: 125,  F: 75,   SF: 45,   QF: 25,  R16: 10,  R32: 1 },
  'Challenger 100': { W: 100,  F: 60,   SF: 35,   QF: 18,  R16: 8,   R32: 0 },
  'Challenger 75':  { W: 75,   F: 45,   SF: 25,   QF: 13,  R16: 5,   R32: 0 },
  'Challenger 50':  { W: 50,   F: 30,   SF: 18,   QF: 8,   R16: 3,   R32: 0 },
  'ITF M25':        { W: 25,   F: 15,   SF: 8,    QF: 4,   R16: 1,   R32: 0 },
  'ITF M15':        { W: 15,   F: 9,    SF: 5,    QF: 2,   R16: 1,   R32: 0 }
}

// Short labels for the tournament banner
const CATEGORY_LABELS = {
  'Grand Slam': 'Grand Slam', 'Masters 1000': 'Masters 1000', 'ATP 500': 'ATP 500', 'ATP 250': 'ATP 250',
  'Challenger 175': 'CH 175', 'Challenger 125': 'CH 125', 'Challenger 100': 'CH 100',
  'Challenger 75': 'CH 75', 'Challenger 50': 'CH 50',
  'ITF M25': 'ITF M25', 'ITF M15': 'ITF M15'
}

// ─── Tournament classification by name keywords ──────────────────
const classifyTournament = (name) => {
  if (!name) return 'ATP 250'
  const n = name.toLowerCase()

  // ITF
  if (n.includes('itf') || n.includes('m15') || n.includes('m25') || n.includes('futures')) {
    if (n.includes('m25') || n.includes('25k')) return 'ITF M25'
    return 'ITF M15'
  }

  // Challenger
  if (n.includes('challenger') || n.includes('ch ')) {
    if (n.includes('175')) return 'Challenger 175'
    if (n.includes('125')) return 'Challenger 125'
    if (n.includes('100')) return 'Challenger 100'
    if (n.includes('75'))  return 'Challenger 75'
    if (n.includes('50'))  return 'Challenger 50'
    return 'Challenger 100' // default challenger
  }

  // Grand Slams
  if (n.includes('australian open') || n.includes('roland garros') || n.includes('french open') || n.includes('wimbledon') || n.includes('us open')) return 'Grand Slam'

  // Masters 1000
  const masters = ['indian wells','miami','monte carlo','monte-carlo','madrid','mutua','rome','roma','internazionali','canadian','montreal','toronto','rogers cup','cincinnati','western & southern','shanghai','rolex shanghai','paris masters','rolex paris','paris-bercy']
  if (masters.some(m => n.includes(m))) return 'Masters 1000'

  // ATP 500
  const atp500 = ['rotterdam','abn amro','dubai','acapulco','abierto mexicano','barcelona','conde de godo','queen','halle','terra wortmann','hamburg','washington','citi open','beijing','china open','tokyo','rakuten','basel','swiss indoors','vienna','erste bank']
  if (atp500.some(m => n.includes(m))) return 'ATP 500'

  return 'ATP 250'
}

// ─── Parse round from tournament_round string ────────────────────
const parseRound = (roundStr) => {
  if (!roundStr) return null
  const lower = roundStr.toLowerCase()
  if (lower.includes('final') && !lower.includes('semi') && !lower.includes('quarter') && !lower.includes('1/')) return 'F'
  if (lower.includes('semi')) return 'SF'
  if (lower.includes('quarter')) return 'QF'
  if (lower.includes('1/8') || lower.includes('round of 16')) return 'R16'
  if (lower.includes('1/16') || lower.includes('round of 32') || lower.includes('2nd round')) return 'R32'
  if (lower.includes('1/32') || lower.includes('round of 64') || lower.includes('1st round')) return 'R64'
  if (lower.includes('1/64') || lower.includes('round of 128')) return 'R128'
  return null
}

const ROUND_ORDER = { R128: 1, R64: 2, R32: 3, R16: 4, QF: 5, SF: 6, F: 7, W: 8 }
const ROUND_LABELS = { R128: 'R128', R64: 'R64', R32: 'R32', R16: 'R16', QF: 'QF', SF: 'SF', F: 'Final', W: 'Campeón' }

const getNextRound = (round) => {
  const order = ['R128','R64','R32','R16','QF','SF','F','W']
  const idx = order.indexOf(round)
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : round
}

// ─── Get Monday-Sunday of current week ───────────────────────────
const getCurrentWeekRange = () => {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d) => d.toISOString().split('T')[0]
  return { start: fmt(monday), end: fmt(sunday) }
}

// ─── Determine which player won a match ──────────────────────────
const getWinnerKey = (fixture) => {
  if (!fixture.event_winner) return null
  if (fixture.event_winner === 'First Player') return fixture.first_player_key
  if (fixture.event_winner === 'Second Player') return fixture.second_player_key
  return null
}

const getPlayerKeyFromFixture = (fixture, playerKey) => {
  return fixture.first_player_key === playerKey || fixture.second_player_key === playerKey
}

// ─── COMPONENT ───────────────────────────────────────────────────
const LiveRanking = () => {
  const navigate = useNavigate()
  const { atpRankings, playerProfiles, fetchPlayerProfile } = useTennis()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weeklyData, setWeeklyData] = useState({}) // player_key -> { earned, defending, tournament, round, status }
  const [activeTournaments, setActiveTournaments] = useState([])
  const [onlyArg, setOnlyArg] = useState(false)
  const [page, setPage] = useState(1)
  const itemsPerPage = 100

  // ─── Fetch weekly fixtures and compute live data ──────────────
  useEffect(() => {
    if (atpRankings.length === 0) return

    const computeLiveData = async () => {
      try {
        setLoading(true)
        setError(null)
        const { start, end } = getCurrentWeekRange()

        // 1) Fetch this week's fixtures (no event_type filter — get everything)
        const fixturesRes = await fetchFromApi('get_fixtures', {
          date_start: start,
          date_stop: end
        })

        const allFixtures = fixturesRes?.result || []
        if (allFixtures.length === 0) {
          setLoading(false)
          return
        }

        // Filter to men's singles only (skip doubles, women, qualifying)
        const MENS_SINGLES_TYPES = [
          'atp singles', 'challenger men singles', 'itf men singles',
          'atp', 'challenger', 'itf men'
        ]
        const fixtures = allFixtures.filter(f => {
          // Skip qualifying rounds
          if (f.event_qualification === 'True' || f.event_qualification === true) return false
          // Skip junior matches
          if (isJuniorMatch(f)) return false
          // Skip doubles
          if (f.event_type_type) {
            const ett = f.event_type_type.toLowerCase()
            if (ett.includes('double') || ett.includes('women') || ett.includes('wta')) return false
            // Accept known men's singles types
            if (MENS_SINGLES_TYPES.some(t => ett.includes(t))) return true
            // Accept anything with 'singles' and 'men' (or just 'singles' if no gender marker)
            if (ett.includes('singles') && !ett.includes('women')) return true
          }
          // If no event_type_type, try to infer from tournament name
          const tn = (f.tournament_name || '').toLowerCase()
          if (tn.includes('women') || tn.includes('wta') || tn.includes('w15') || tn.includes('w25') || tn.includes('w35') || tn.includes('w50') || tn.includes('w75') || tn.includes('w100')) return false
          if (tn.includes('double')) return false
          return true
        })

        if (fixtures.length === 0) {
          setLoading(false)
          return
        }

        // 2) Identify unique tournaments this week
        const tournamentsMap = {}
        fixtures.forEach(f => {
          if (!tournamentsMap[f.tournament_key]) {
            const cat = classifyTournament(f.tournament_name)
            tournamentsMap[f.tournament_key] = {
              key: f.tournament_key,
              name: f.tournament_name,
              season: f.tournament_season,
              category: cat,
              categoryLabel: CATEGORY_LABELS[cat] || cat
            }
          }
        })

        // Sort: Grand Slam > M1000 > 500 > 250 > Challenger > ITF
        const CAT_ORDER = ['Grand Slam','Masters 1000','ATP 500','ATP 250','Challenger 175','Challenger 125','Challenger 100','Challenger 75','Challenger 50','ITF M25','ITF M15']
        const sortedTournaments = Object.values(tournamentsMap).sort((a, b) => {
          return (CAT_ORDER.indexOf(a.category) || 99) - (CAT_ORDER.indexOf(b.category) || 99)
        })
        setActiveTournaments(sortedTournaments)

        // 3) For each player, find their best result this week
        const playerResults = {} // player_key -> { round, won, tournament_key, tournament_name }

        fixtures.forEach(f => {
          const round = parseRound(f.tournament_round)
          if (!round) return

          const processPlayer = (pKey) => {
            if (!pKey) return
            const existing = playerResults[pKey]
            const roundVal = ROUND_ORDER[round] || 0

            if (!existing || roundVal > (ROUND_ORDER[existing.round] || 0)) {
              const wonThis = getWinnerKey(f) === pKey
              const isFinished = f.event_status === 'Finished'

              playerResults[pKey] = {
                round: isFinished && wonThis ? getNextRound(round) : round,
                status: isFinished ? (wonThis ? 'advanced' : 'eliminated') : 'playing',
                tournament_key: f.tournament_key,
                tournament_name: f.tournament_name
              }
            }
          }

          processPlayer(f.first_player_key)
          processPlayer(f.second_player_key)
        })

        // 4) Try to fetch last year's results for defending points
        const currentYear = parseInt(fixtures[0]?.tournament_season || new Date().getFullYear())
        const lastYear = currentYear - 1
        const defendingPoints = {} // player_key -> points

        const tournamentKeys = Object.keys(tournamentsMap)
        const lastYearPromises = tournamentKeys.map(async (tk) => {
          try {
            const res = await fetchFromApi('get_fixtures', {
              tournament_key: tk,
              tournament_season: String(lastYear),
              date_start: `${lastYear}-01-01`,
              date_stop: `${lastYear}-12-31`
            })
            const lastFixtures = res?.result || []
            const cat = tournamentsMap[tk].category

            // For each player, find their best result last year
            const lastYearResults = {}
            lastFixtures.forEach(lf => {
              if (lf.event_qualification === 'True' || lf.event_qualification === true) return
              const r = parseRound(lf.tournament_round)
              if (!r) return

              const processLastYear = (pk) => {
                if (!pk) return
                const ex = lastYearResults[pk]
                const rv = ROUND_ORDER[r] || 0
                if (!ex || rv > (ROUND_ORDER[ex.round] || 0)) {
                  const won = getWinnerKey(lf) === pk
                  const finished = lf.event_status === 'Finished'
                  lastYearResults[pk] = {
                    round: finished && won ? getNextRound(r) : r
                  }
                }
              }
              processLastYear(lf.first_player_key)
              processLastYear(lf.second_player_key)
            })

            // Calculate defending points
            Object.entries(lastYearResults).forEach(([pk, data]) => {
              const pts = POINTS_TABLE[cat]?.[data.round] || 0
              defendingPoints[pk] = (defendingPoints[pk] || 0) + pts
            })
          } catch (e) {
            console.warn(`Could not fetch last year data for tournament ${tk}`, e)
          }
        })

        await Promise.all(lastYearPromises)

        // 5) Build weekly data for each player
        const weekly = {}
        Object.entries(playerResults).forEach(([pk, data]) => {
          const cat = tournamentsMap[data.tournament_key]?.category || 'ATP 250'
          const earned = POINTS_TABLE[cat]?.[data.round] || 0
          const defending = defendingPoints[pk] || 0

          weekly[pk] = {
            earned,
            defending,
            diff: earned - defending,
            tournament: data.tournament_name,
            round: data.round,
            roundLabel: ROUND_LABELS[data.round] || data.round,
            status: data.status,
            category: cat
          }
        })

        setWeeklyData(weekly)
        setLoading(false)
      } catch (err) {
        console.error('Error computing live ranking:', err)
        setError('No se pudieron cargar los datos en vivo. Intentá más tarde.')
        setLoading(false)
      }
    }

    computeLiveData()
  }, [atpRankings])

  // ─── Build live rankings ──────────────────────────────────────
  const liveRankings = useMemo(() => {
    if (atpRankings.length === 0) return []

    return atpRankings.map(r => {
      const pk = r.player_key
      const officialPts = parseInt(r.points) || 0
      const wd = weeklyData[pk]

      if (wd) {
        const livePts = officialPts + wd.diff
        return { ...r, livePoints: livePts, weeklyDiff: wd.diff, weeklyData: wd, officialPoints: officialPts }
      }
      return { ...r, livePoints: officialPts, weeklyDiff: 0, weeklyData: null, officialPoints: officialPts }
    }).sort((a, b) => b.livePoints - a.livePoints)
      .map((r, i) => ({ ...r, livePlace: i + 1, officialPlace: parseInt(r.place) || 0 }))
  }, [atpRankings, weeklyData])

  // ─── Filters & pagination ─────────────────────────────────────
  const filteredRankings = useMemo(() => {
    if (!onlyArg) return liveRankings
    return liveRankings.filter(r => {
      const profile = playerProfiles[r.player_key]
      return profile?.code?.toLowerCase() === 'ar'
    })
  }, [liveRankings, onlyArg, playerProfiles])

  const pagedRankings = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return filteredRankings.slice(start, start + itemsPerPage)
  }, [filteredRankings, page])

  useEffect(() => { setPage(1) }, [onlyArg])

  useEffect(() => {
    if (pagedRankings.length > 0) {
      pagedRankings.forEach(r => {
        if (r.player_key) fetchPlayerProfile(r.player_key)
      })
    }
  }, [pagedRankings, fetchPlayerProfile])

  const totalPages = Math.ceil(filteredRankings.length / itemsPerPage)

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ─── Week dates for display ────────────────────────────────────
  const { start, end } = getCurrentWeekRange()
  const weekLabel = `${start.split('-').reverse().join('/')} — ${end.split('-').reverse().join('/')}`

  return (
    <div className="detail-view">
      <SEO
        title="Ranking ATP En Vivo"
        description="Ranking ATP en vivo proyectado. Seguí los movimientos de puntos durante la semana en curso."
        keywords="ranking atp en vivo, live ranking, proyección ranking tenis, puntos atp semana"
        canonicalUrl="/ranking/en-vivo"
      />
      <div className="detail-header" style={{ marginBottom: '20px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="back-btn" onClick={() => navigate(-1)}>← VOLVER</button>
          <div style={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-dot" />
            RANKING EN VIVO ATP
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className={`main-header-block_button main-header-block_button-arg ${onlyArg ? 'active' : ''}`}
            onClick={() => setOnlyArg(!onlyArg)}
            style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, height: '34px', display: 'flex', alignItems: 'center' }}
          >
            🇦🇷 ARG
          </button>
          <Link
            to="/ranking"
            className="main-header-block_button"
            style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, height: '34px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            📋 Oficial
          </Link>
        </div>
      </div>

      {/* Active tournaments banner removed */}

      {error && <div style={{ color: '#ff5252', textAlign: 'center', padding: '20px' }}>{error}</div>}

      <div className="leagues-container" style={{ padding: '0 20px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left', color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '15px 5px', width: '50px' }}>Live</th>
              <th style={{ padding: '15px 5px' }}>Jugador</th>
              <th style={{ padding: '15px 5px', textAlign: 'right', width: '70px' }}>Puntos</th>
              <th style={{ padding: '15px 5px', textAlign: 'right', width: '60px' }}>Dif</th>
            </tr>
          </thead>
          <tbody>
            {loading || pagedRankings.length === 0 ? (
              <>
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '15px 5px' }}><div className="skeleton-base skeleton-rank" /></td>
                    <td style={{ padding: '15px 5px' }}><div className="skeleton-base skeleton-ranking-player" /></td>
                    <td style={{ padding: '15px 5px' }}><div className="skeleton-base skeleton-ranking-points" /></td>
                    <td style={{ padding: '15px 5px' }}><div className="skeleton-base skeleton-rank" /></td>
                  </tr>
                ))}
              </>
            ) : (
              pagedRankings.map((r) => {
                const posChange = r.officialPlace - r.livePlace
                const wd = r.weeklyData

                return (
                  <tr
                    key={r.player_key}
                    className={`ranking-row ${wd ? 'live-active-player' : ''}`}
                    style={{ borderBottom: '1px solid #222', cursor: r.player_key ? 'pointer' : 'default' }}
                    onClick={() => r.player_key && navigate(`/jugador/${r.player_key}`)}
                  >
                    <td style={{ padding: '12px 5px', fontWeight: 'bold' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: 'var(--ball-yellow)', minWidth: '25px' }}>{r.livePlace}</span>
                        {posChange > 0 && <span className="live-move live-move-up">▲{posChange}</span>}
                        {posChange < 0 && <span className="live-move live-move-down">▼{Math.abs(posChange)}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 5px', fontWeight: 500 }}>
                      <PlayerFlag playerKey={r.player_key} />
                      <span style={{ marginLeft: '10px' }}>{r.player}</span>
                      {wd && <span className="live-playing-badge">{wd.status === 'eliminated' ? '🔴' : '🟢'}</span>}
                    </td>
                    <td style={{ padding: '12px 5px', textAlign: 'right', fontWeight: '900' }}>
                      {r.livePoints.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 5px', textAlign: 'right' }}>
                      {r.weeklyDiff !== 0 ? (
                        <span style={{ color: r.weeklyDiff > 0 ? '#00e676' : '#ff5252', fontWeight: 700, fontSize: '0.85rem' }}>
                          {r.weeklyDiff > 0 ? '+' : ''}{r.weeklyDiff}
                        </span>
                      ) : (
                        <span style={{ color: '#555', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredRankings.length > itemsPerPage && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '30px 0', marginTop: '10px' }}>
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className="main-header-block_button"
            style={{ opacity: page === 1 ? 0.3 : 1, cursor: page === 1 ? 'default' : 'pointer', minWidth: '120px' }}
          >
            ← ANTERIOR
          </button>
          <span style={{ color: '#aaa', fontWeight: 600, fontSize: '0.9rem' }}>
            PÁGINA {page} DE {totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="main-header-block_button"
            style={{ opacity: page >= totalPages ? 0.3 : 1, cursor: page >= totalPages ? 'default' : 'pointer', minWidth: '120px' }}
          >
            SIGUIENTE →
          </button>
        </div>
      )}

      {/* Info section */}
      <section className="live-ranking-info">
        <h2>¿Cómo funciona el Ranking En Vivo?</h2>
        <p>
          El ranking en vivo es una <strong>proyección</strong> de cómo quedaría el ranking ATP al finalizar la semana en curso,
          basándose en los resultados parciales de los torneos activos.
        </p>
        <div className="live-info-grid">
          <div className="live-info-card">
            <h4>📊 Puntos Ganados</h4>
            <p>Se calculan según la ronda alcanzada en el torneo actual y la categoría del torneo (Grand Slam, Masters 1000, ATP 500, ATP 250, Challenger, ITF).</p>
          </div>
          <div className="live-info-card">
            <h4>📉 Puntos a Defender</h4>
            <p>Se restan los puntos que el jugador ganó en la misma semana del año pasado, ya que esos puntos "caen" del ranking.</p>
          </div>
          <div className="live-info-card">
            <h4>🔢 Fórmula</h4>
            <p><code>Live = Oficial − Defendiendo + Ganados</code></p>
          </div>
        </div>
        <p style={{ marginTop: '15px', fontSize: '0.85rem', color: '#888' }}>
          ⚠️ Esta proyección es aproximada. El ranking oficial se actualiza cada lunes por la ATP.
        </p>
      </section>
    </div>
  )
}

export default LiveRanking
