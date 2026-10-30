import React from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MASTER_TOURNAMENTS } from '../constants/tennis'
import { fetchFromApi } from '../services/tennisApi'
import { USER_TIMEZONE } from '../utils/tennisHelpers'
import ErrorBoundary from '../components/common/ErrorBoundary'

const TournamentListComponent = () => {
  const { categoryId } = useParams()
  const navigate = useNavigate()

  // Update document title
  React.useEffect(() => {
    document.title = `Torneos ${categoryId} - DobleFalta`;
  }, [categoryId]);

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

        if (type.includes('DOUBLES') || (m.tournament_name || '').toUpperCase().includes('DOUBLES')) return;

        if (type.includes('CHALLENGER') || (m.tournament_name || '').toLowerCase().includes('challenger')) {
          const key = m.tournament_key?.toString()
          if (key && !seen.has(key)) {
            seen.add(key)
            challengers.push({
              id: key,
              apiKey: key,
              name: m.tournament_name || 'Challenger',
              tourType: type.includes('WOMEN') || type.includes('WTA') ? 'WTA' : 'ATP',
              city: '-',
              surface: '-',
              duration: '-'
            })
          }
        }
      })
      return challengers
    },
    enabled: categoryId === 'Challenger'
  })

  // Determine which list to show
  const tournamentsArray = categoryId === 'Challenger' 
    ? dynamicTournaments 
    : (MASTER_TOURNAMENTS[categoryId] || [])

  return (
    <div className="tournaments-view">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/')}>← VOLVER</button>
        <div style={{ fontWeight: 900 }}>LISTADO DE TORNEOS {categoryId}</div>
      </div>
      <div className="tournaments-grid">
        {categoryId === 'Challenger' && isLoading && <div style={{ color: '#aaa', padding: '20px' }}>Buscando torneos en juego...</div>}
        {categoryId === 'Challenger' && !isLoading && tournamentsArray.length === 0 && <div style={{ color: '#aaa', padding: '20px' }}>No hay torneos Challenger activos hoy.</div>}
        
        {tournamentsArray.map(tour => (
          <Link 
            key={tour.id} 
            to={`/tournament/${categoryId}/${tour.id}`} 
            state={{ dynamicTournament: tour }}
            className="tournament-card"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div className="tournament-card-name">{tour.name}</div>
            <div className="tournament-card-info" style={{ marginTop: '8px' }}>
              {tour.tourType ? (
                <span style={{ 
                  background: tour.tourType === 'WTA' ? '#e91e63' : '#2196f3', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  {tour.tourType}
                </span>
              ) : tour.city}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const TournamentList = () => (
  <ErrorBoundary>
    <TournamentListComponent />
  </ErrorBoundary>
)

export default TournamentList
