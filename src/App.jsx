import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import './App.css'

import { MASTER_TOURNAMENTS } from './constants/tennis'
import { useTennis } from './context/TennisContext'

import Home from './pages/Home'
import MatchDetail from './pages/MatchDetail'
import TournamentList from './pages/TournamentList'
import TournamentDetail from './pages/TournamentDetail'
import Ranking from './pages/Ranking'
import LiveRanking from './pages/LiveRanking'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Community from './pages/Community'
import CommunityThread from './pages/CommunityThread'
import NewTopic from './pages/NewTopic'
import Games from './pages/Games'
import GameGuessPlayer from './pages/GameGuessPlayer'
import GameWordle from './pages/GameWordle'
import GameTop10 from './pages/GameTop10'
import GameH2H from './pages/GameH2H'
import HeadToHead from './pages/HeadToHead'
import PlayerDetail from './pages/PlayerDetail'
import NewsList from './pages/NewsList'
import NewsDetail from './pages/NewsDetail'
import SuggestionModal from './components/SuggestionModal'
import Footer from './components/common/Footer'
import CookieConsent from './components/CookieConsent'

function App() {
  const navigate = useNavigate()
  const { atpRankings } = useTennis()
  const [expanded, setExpanded] = useState({ atp: false, slams: false, challenger: false })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSidebar = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false)
  }

  return (
    <div className="layout_wrapper">
      <header className="header">
        <div className="header__container">
          <div className="header__logo" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              ☰
            </button>
            <Link to="/" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={closeMobileMenu}>
              <img src="/logo-horizontal.svg" alt="DOBLE FALTA" style={{ height: '52px', objectFit: 'contain' }} />
            </Link>
          </div>
          <div className="header__buttons">
            <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>PARTIDOS EN VIVO</div>
          </div>
        </div>
      </header>

      <main className="layout_main">
        <div className="main-block__container">

          {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
          <aside className={`aside_mainBlockAside ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <div className="aside_asideBlockMenu">
              <button className="aside_selectBlockButton">
                <span>DESTACADO</span>
                <span>▼</span>
              </button>
              <div className="aside_selectList">
                <div className="aside_selectItem" onClick={() => toggleSidebar('atp')}>
                  ATP Tour <span>{expanded.atp ? '▲' : '▼'}</span>
                </div>
                {expanded.atp && (
                  <div className="aside_subList">
                    <Link to="/category/ATP 1000" className="aside_subItem" style={{ display: 'block' }} onClick={closeMobileMenu}>ATP 1000</Link>
                    <Link to="/category/ATP 500" className="aside_subItem" style={{ display: 'block' }} onClick={closeMobileMenu}>ATP 500</Link>
                    <Link to="/category/ATP 250" className="aside_subItem" style={{ display: 'block' }} onClick={closeMobileMenu}>ATP 250</Link>
                  </div>
                )}
                <div className="aside_selectItem" onClick={() => toggleSidebar('slams')}>
                  Grand Slams <span>{expanded.slams ? '▲' : '▼'}</span>
                </div>
                {expanded.slams && (
                  <div className="aside_subList">
                    {MASTER_TOURNAMENTS['Slams'].map(tour => (
                      <Link
                        key={tour.id}
                        to={`/tournament/Slams/${tour.id}`}
                        className="aside_subItem"
                        style={{ display: 'block' }}
                        onClick={closeMobileMenu}
                      >
                        {tour.name}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="aside_selectItem" onClick={() => toggleSidebar('challenger')}>
                  Challenger Tour <span>{expanded.challenger ? '▲' : '▼'}</span>
                </div>
                {expanded.challenger && (
                  <div className="aside_subList">
                    <Link to="/category/Challenger" className="aside_subItem" style={{ display: 'block' }} onClick={closeMobileMenu}>Ver Torneos</Link>
                  </div>
                )}
                <div className="aside_selectItem" onClick={() => { navigate('/h2h'); closeMobileMenu(); }}>
                  Historial H2H
                </div>
              </div>
            </div>

            <div className="aside_asideBlockMenu" onClick={() => { navigate('/ranking'); closeMobileMenu(); }} style={{ cursor: 'pointer' }}>
              <button className="aside_selectBlockButton" style={{ background: 'var(--clay-orange)' }}>
                <span>RANKING ATP</span>
              </button>
              <table className="ranking-table">
                <tbody>
                  {atpRankings.length > 0 ? (
                    atpRankings.slice(0, 10).map((r, i) => (
                      <tr key={r.player_key || i}>
                        <td className="rank-num">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {r.place}
                            <span style={{
                              color: r.movement === 'up' ? '#00e676' : r.movement === 'down' ? '#ff5252' : '#888',
                              fontSize: '0.55rem'
                            }}>
                              {r.movement === 'up' ? '▲' : r.movement === 'down' ? '▼' : '='}
                            </span>
                          </div>
                        </td>
                        <td title={r.player}>{r.player.length > 14 ? r.player.substring(0, 12) + '...' : r.player}</td>
                        <td className="rank-pts">{parseInt(r.points).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: '#888', padding: '10px' }}>Cargando...</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Botón del Foro debajo del Ranking */}
            <div
              className="aside_asideBlockMenu"
              onClick={() => { navigate('/noticias'); closeMobileMenu(); }}
              style={{ cursor: 'pointer', marginTop: '20px', padding: '15px 15px', background: 'var(--clay-dark)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--ball-yellow)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--clay-dark)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--ball-yellow)', fontWeight: '900', letterSpacing: '0.5px' }}>NOTICIAS Y CRÓNICAS</span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#999' }}>Análisis del circuito y ATP</p>
            </div>

            <div
              className="aside_asideBlockMenu"
              onClick={() => { navigate('/comunidad'); closeMobileMenu(); }}
              style={{ cursor: 'pointer', marginTop: '15px', padding: '15px 15px', background: 'var(--clay-dark)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--ball-yellow)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--clay-dark)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--ball-yellow)', fontWeight: '900', letterSpacing: '0.5px' }}>COMUNIDAD / FORO</span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#999' }}>Sumate al debate de tenis</p>
            </div>

            {/* Nuevo botón de Juegos del día */}
            <div
              className="aside_asideBlockMenu"
              onClick={() => { navigate('/juegos'); closeMobileMenu(); }}
              style={{ cursor: 'pointer', marginTop: '15px', padding: '15px 15px', background: 'var(--clay-dark)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--ball-yellow)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--clay-dark)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--ball-yellow)', fontWeight: '900', letterSpacing: '0.5px' }}>CANCHA DE JUEGOS</span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#999' }}>Juega, adivina y compite</p>
            </div>

          </aside>

          <div className="layout_mainBlockContent">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/match/:matchId" element={<MatchDetail />} />
              <Route path="/category/:categoryId" element={<TournamentList />} />
              <Route path="/tournament/:categoryId/:tournamentId" element={<TournamentDetail />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/ranking/en-vivo" element={<LiveRanking />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              {/* Rutas de noticias y crónicas */}
              <Route path="/noticias" element={<NewsList />} />
              <Route path="/noticias/:slug" element={<NewsDetail />} />
              {/* Rutas de comunidad */}
              <Route path="/comunidad" element={<Community />} />
              <Route path="/comunidad/nuevo" element={<NewTopic />} />
              <Route path="/comunidad/:threadId" element={<CommunityThread />} />
              <Route path="/juegos" element={<Games />} />
              <Route path="/juegos/adivina" element={<GameGuessPlayer />} />
              <Route path="/juegos/tenisdle" element={<GameWordle />} />
              <Route path="/juegos/top10" element={<GameTop10 />} />
              <Route path="/juegos/racha-h2h" element={<GameH2H />} />
              <Route path="/jugador/:id" element={<PlayerDetail />} />
              <Route path="/h2h" element={<HeadToHead />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </main>

      <Footer />
      <SuggestionModal />
      <CookieConsent />
    </div>
  )
}

export default App
