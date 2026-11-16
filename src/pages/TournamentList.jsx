import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MASTER_TOURNAMENTS } from '../constants/tennis'
import { fetchFromApi } from '../services/tennisApi'
import { USER_TIMEZONE } from '../utils/tennisHelpers'
import ErrorBoundary from '../components/common/ErrorBoundary'
import SEO from '../components/common/SEO'

const CATEGORIES_ORDER = ['Slams', 'ATP 1000', 'ATP 500', 'ATP 250', 'Challenger']

const CATEGORY_LABELS = {
  'TODOS': 'Todos los Torneos',
  'Slams': 'Grand Slams (2000 pts)',
  'ATP 1000': 'ATP Masters 1000',
  'ATP 500': 'ATP Tour 500',
  'ATP 250': 'ATP Tour 250',
  'Challenger': 'ATP Challenger Tour En Juego'
}

const TournamentListComponent = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState(categoryId || 'TODOS')

  useEffect(() => {
    setSelectedTab(categoryId || 'TODOS')
  }, [categoryId])

  const { data: dynamicTournaments = [], isLoading } = useQuery({
    queryKey: ['activeChallengersList'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetchFromApi('get_fixtures', { date_start: today, date_stop: today, timezone: USER_TIMEZONE })
      if (res.success !== 1 || !res.result) return []

      const challengers = []
      const seen = new Set()
      res.result.forEach(m => {
        const type = (m.event_type_type || '').toUpperCase()
        if (type.includes('DOUBLES') || (m.tournament_name || '').toUpperCase().includes('DOUBLES')) return

        if (type.includes('CHALLENGER') || (m.tournament_name || '').toLowerCase().includes('challenger')) {
          const key = m.tournament_key?.toString()
          if (key && !seen.has(key)) {
            seen.add(key)
            challengers.push({
              id: key,
              apiKey: key,
              name: m.tournament_name || 'Challenger',
              tourType: type.includes('WOMEN') || type.includes('WTA') ? 'WTA' : 'ATP',
              city: 'Circuito Internacional',
              surface: '-',
              duration: 'En disputa'
            })
          }
        }
      })
      return challengers
    },
    enabled: selectedTab === 'Challenger' || selectedTab === 'TODOS'
  })

  const categoriesToDisplay = selectedTab === 'TODOS'
    ? CATEGORIES_ORDER
    : [selectedTab]

  const seoTitle = categoryId
    ? `Torneos ${categoryId}: Calendario, Cuadros y Campeones - DobleFalta`
    : 'Calendario y Directorio de Torneos ATP, Grand Slams y Challenger - DobleFalta'

  const seoDescription = categoryId
    ? `Explora todos los torneos de categoría ${categoryId}: sedes, superficies, fechas del calendario e historial de campeones en DobleFalta.`
    : 'Directorio completo de torneos oficiales de tenis: los cuatro Grand Slams, los nueve Masters 1000, torneos ATP 500, ATP 250 y la gira Challenger en vivo.'

  return (
    <div className="tournaments-view" style={{ paddingBottom: '40px' }}>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={categoryId ? `/category/${encodeURIComponent(categoryId)}` : '/tournaments'}
      />

      <div className="detail-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <button className="back-btn" onClick={() => navigate('/')}>← VOLVER</button>
        <h1 style={{ fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>
          {categoryId ? `LISTADO DE TORNEOS ${categoryId.toUpperCase()}` : 'DIRECTORIO Y CALENDARIO DE TORNEOS'}
        </h1>
      </div>

      {/* Pestañas selectoras de categoría */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '0 20px 20px' }}>
        {['TODOS', ...CATEGORIES_ORDER].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              background: selectedTab === tab ? 'var(--clay-orange)' : 'rgba(255,255,255,0.06)',
              color: selectedTab === tab ? '#fff' : '#ccc',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: selectedTab === tab ? '700' : '500',
              cursor: 'pointer'
            }}
          >
            {tab === 'TODOS' ? 'Todos' : tab === 'Slams' ? 'Grand Slams' : tab}
          </button>
        ))}
      </div>

      {categoriesToDisplay.map(cat => {
        const list = cat === 'Challenger'
          ? dynamicTournaments
          : (MASTER_TOURNAMENTS[cat] || [])

        return (
          <section key={cat} style={{ marginBottom: '32px' }}>
            <h2 style={{
              color: 'var(--ball-yellow)',
              fontSize: '1.15rem',
              padding: '0 20px',
              marginBottom: '14px'
            }}>
              {CATEGORY_LABELS[cat] || cat}
            </h2>

            <div className="tournaments-grid">
              {cat === 'Challenger' && isLoading && (
                <div style={{ color: '#aaa', padding: '20px' }}>Buscando torneos Challenger en juego...</div>
              )}
              {cat === 'Challenger' && !isLoading && list.length === 0 && (
                <div style={{ color: '#aaa', padding: '20px' }}>No hay torneos Challenger activos en la jornada de hoy.</div>
              )}

              {list.map(tour => {
                const lastChamp = tour.champions?.[0]
                return (
                  <Link
                    key={tour.id}
                    to={`/tournament/${cat}/${tour.id}`}
                    state={{ dynamicTournament: tour }}
                    className="tournament-card"
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div className="tournament-card-name">{tour.name}</div>
                    <div className="tournament-card-info" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {tour.tourType ? (
                        <span style={{
                          background: tour.tourType === 'WTA' ? '#e91e63' : '#2196f3',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          alignSelf: 'flex-start'
                        }}>
                          {tour.tourType}
                        </span>
                      ) : (
                        <span>📍 {tour.city} {tour.surface && tour.surface !== '-' ? `• ${tour.surface}` : ''}</span>
                      )}
                      {tour.duration && tour.duration !== '-' && (
                        <span style={{ fontSize: '0.78rem', color: '#aaa' }}>📅 {tour.duration}</span>
                      )}
                      {lastChamp && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--ball-yellow)' }}>
                          🏆 Último campeón registrado: {lastChamp.name} ({lastChamp.year})
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Guía Editorial del Calendario y Categorías para SEO y AdSense */}
      <section style={{
        padding: '30px 20px',
        maxWidth: '880px',
        margin: '20px auto 0',
        color: '#ccc',
        lineHeight: '1.8',
        fontSize: '0.94rem',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h2 style={{ color: 'var(--ball-yellow)', fontSize: '1.4rem', marginTop: 0, marginBottom: '14px' }}>
          Estructura del Calendario Mundial de Tenis: De los Grand Slams a la gira Challenger
        </h2>
        <p style={{ marginBottom: '14px' }}>
          El calendario oficial del tenis profesional articula más de sesenta torneos de primera línea distribuidos en los cinco continentes entre enero y noviembre. En este directorio interactivo de <strong>DobleFalta</strong> podés consultar la ficha histórica, superficie, ciudad sede, cuadro de partidos y palmarés de campeones de cada certamen.
        </p>
        <p style={{ marginBottom: 0 }}>
          Desde los cuatro <strong>Grand Slams</strong> (Abierto de Australia, Roland Garros, Wimbledon y US Open) y los nueve <strong>ATP Masters 1000</strong> obligatorios hasta las citas tradicionales del <em>Golden Swing</em> sudamericano como el <strong>Argentina Open</strong> en Buenos Aires y el Río Open, cada categoría define el reparto de puntos que alimenta el <Link to="/ranking" style={{ color: 'var(--ball-yellow)' }}>Ranking Mundial ATP y WTA</Link>.
        </p>
      </section>
    </div>
  )
}

const TournamentList = () => (
  <ErrorBoundary>
    <TournamentListComponent />
  </ErrorBoundary>
)

export default TournamentList
