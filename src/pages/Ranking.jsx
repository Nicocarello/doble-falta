import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTennis } from '../context/TennisContext'
import PlayerFlag from '../components/common/PlayerFlag'
import SEO from '../components/common/SEO'
import '../components/common/SkeletonLoader.css'

const MovementIndicator = ({ movement }) => {
  const baseStyle = {
    fontSize: '0.6rem',
    marginLeft: '8px',
    padding: '2px 5px',
    borderRadius: '4px',
    fontWeight: '900',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '22px'
  }
  
  if (movement === 'up') {
    return <span style={{ ...baseStyle, backgroundColor: 'rgba(0, 230, 118, 0.2)', color: '#00e676' }} title="Subió">▲</span>
  }
  if (movement === 'down') {
    return <span style={{ ...baseStyle, backgroundColor: 'rgba(255, 82, 82, 0.2)', color: '#ff5252' }} title="Bajó">▼</span>
  }
  return <span style={{ ...baseStyle, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#888' }} title="Sin cambios">=</span>
}

const Ranking = () => {
  const navigate = useNavigate()
  const { atpRankings, wtaRankings, playerProfiles, fetchPlayerProfile } = useTennis()
  const [category, setCategory] = React.useState('ATP')
  const [onlyArg, setOnlyArg] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const itemsPerPage = 100

  const currentRankings = category === 'ATP' ? atpRankings : wtaRankings

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [category, onlyArg])

  const titlePrefix = onlyArg ? `Ranking Argentino` : `Ranking Mundial`;
  const seoTitle = `${titlePrefix} ${category}`;
  const seoDescription = `Consulta el ${seoTitle} actualizado. Sigue el progreso de los mejores tenistas del mundo ${onlyArg ? 'y especialmente de los representantes argentinos' : ''} en el circuito profesional.`;
  const seoKeywords = `ranking ${category.toLowerCase()}, tenis profesional, ${onlyArg ? 'tenis argentino, jugadores argentinos,' : ''} puntos atp, puntos wta, escalafon tenis`;

  const filteredRankings = React.useMemo(() => {
    if (!onlyArg) return currentRankings;
    return currentRankings.filter(r => {
      const profile = playerProfiles[r.player_key];
      return profile?.code?.toLowerCase() === 'ar';
    });
  }, [currentRankings, onlyArg, playerProfiles]);

  const pagedRankings = React.useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredRankings.slice(start, start + itemsPerPage);
  }, [filteredRankings, page]);

  // Pre-fetch for the current rankings list (paged) to ensure ARG filter works snappy
  React.useEffect(() => {
    if (pagedRankings.length > 0) {
      pagedRankings.forEach(r => {
        if (r.player_key) fetchPlayerProfile(r.player_key);
      });
    }
  }, [pagedRankings, fetchPlayerProfile]);

  const totalPages = Math.ceil(filteredRankings.length / itemsPerPage);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="detail-view">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl="/ranking"
      />
      <div className="detail-header" style={{ marginBottom: '20px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="back-btn" onClick={() => navigate(-1)}>← VOLVER</button>
          <div style={{ fontWeight: 900 }}>RANKING MUNDIAL {category}</div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className={`main-header-block_button main-header-block_button-arg ${onlyArg ? 'active' : ''}`}
            onClick={() => setOnlyArg(!onlyArg)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '4px', 
              fontSize: '0.8rem',
              fontWeight: 700,
              height: '34px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            🇦🇷 ARG
          </button>

          <Link
            to="/ranking/en-vivo"
            className="main-header-block_button"
            style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, height: '34px', display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '5px' }}
          >
            <span style={{ width: '8px', height: '8px', background: '#ff1744', borderRadius: '50%', display: 'inline-block', animation: 'livePulse 1.5s infinite' }} />
            En Vivo
          </Link>

          <div style={{ display: 'flex', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '6px', height: '34px', alignItems: 'center' }}>
            <button 
              onClick={() => setCategory('ATP')}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '4px', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: category === 'ATP' ? 'var(--ball-yellow)' : 'transparent',
                color: category === 'ATP' ? 'black' : 'white',
                height: '100%'
              }}
            >
              ATP
            </button>
            <button 
              onClick={() => setCategory('WTA')}
              style={{ 
                padding: '6px 12px', 
                borderRadius: '4px', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: category === 'WTA' ? 'var(--ball-yellow)' : 'transparent',
                color: category === 'WTA' ? 'black' : 'white',
                height: '100%'
              }}
            >
              WTA
            </button>
          </div>
        </div>
      </div>
      
      <div className="leagues-container" style={{ padding: '0 20px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left', color: '#aaa', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '15px 5px', width: '80px' }}>Rank</th>
              <th style={{ padding: '15px 5px' }}>Jugador</th>
              <th style={{ padding: '15px 5px', textAlign: 'right' }}>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {pagedRankings.length > 0 ? (
              pagedRankings.map((r, i) => (
                <tr 
                  key={r.player_key || i} 
                  style={{ borderBottom: '1px solid #222', cursor: r.player_key ? 'pointer' : 'default' }} 
                  className="ranking-row"
                  onClick={() => r.player_key && navigate(`/jugador/${r.player_key}`)}
                >
                  <td style={{ padding: '15px 5px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'var(--ball-yellow)', minWidth: '25px' }}>{r.place}</span>
                      <MovementIndicator movement={r.movement} />
                    </div>
                  </td>
                  <td style={{ padding: '15px 5px', fontWeight: 500 }}>
                    <PlayerFlag playerKey={r.player_key} /> 
                    <span style={{ marginLeft: '10px' }}>{r.player}</span>
                  </td>
                  <td style={{ padding: '15px 5px', textAlign: 'right', color: '#ccc', fontWeight: '900' }}>
                    {(parseInt(r.points) || 0).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '15px 5px' }}><div className="skeleton-base skeleton-rank" /></td>
                    <td style={{ padding: '15px 5px' }}><div className="skeleton-base skeleton-ranking-player" /></td>
                    <td style={{ padding: '15px 5px' }}><div className="skeleton-base skeleton-ranking-points" /></td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {filteredRankings.length > itemsPerPage && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '20px', 
          padding: '30px 0',
          marginTop: '10px'
        }}>
          <button 
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className="main-header-block_button"
            style={{ 
              opacity: page === 1 ? 0.3 : 1, 
              cursor: page === 1 ? 'default' : 'pointer',
              minWidth: '120px'
            }}
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
            style={{ 
              opacity: page >= totalPages ? 0.3 : 1, 
              cursor: page >= totalPages ? 'default' : 'pointer',
              minWidth: '120px'
            }}
          >
            SIGUIENTE →
          </button>
        </div>
      )}
      
      {/* SECCIÓN DE CONTENIDO ESTÁTICO (PARA ADSENSE/SEO) */}
      <section className="static-about-section" style={{ 
        padding: '60px 20px', 
        maxWidth: '800px', 
        margin: '0 auto', 
        color: '#ccc',
        lineHeight: '1.8',
        fontSize: '0.95rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        marginTop: '40px'
      }}>
        <h2 style={{ color: 'var(--ball-yellow)', marginBottom: '20px', fontSize: '1.5rem' }}>¿Cómo funciona el Ranking ATP y WTA?</h2>
        <p style={{ marginBottom: '15px' }}>
          El ranking profesional de tenis es un sistema basado en el rendimiento de los jugadores durante las últimas 52 semanas. 
          Los puntos se otorgan según la instancia alcanzada en los torneos oficiales del circuito.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px' }}>
            <h4 style={{ color: 'var(--ball-yellow)', marginBottom: '10px' }}>Grand Slams</h4>
            <p style={{ fontSize: '0.85rem' }}>Otorgan 2000 puntos al campeón. Son los torneos de mayor prestigio y dificultad.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px' }}>
            <h4 style={{ color: 'var(--ball-yellow)', marginBottom: '10px' }}>Masters 1000</h4>
            <p style={{ fontSize: '0.85rem' }}>El campeón suma 1000 puntos. Son obligatorios para los jugadores del top del ranking.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px' }}>
            <h4 style={{ color: 'var(--ball-yellow)', marginBottom: '10px' }}>ATP 500 y 250</h4>
            <p style={{ fontSize: '0.85rem' }}>Torneos fundamentales para la base del circuito y el ascenso de jóvenes promesas.</p>
          </div>
        </div>
        <p>
          En <strong>DobleFalta</strong>, actualizamos estas posiciones semanalmente para que puedas seguir de cerca el ascenso de los tenistas en el escalafón mundial, con especial atención a los movimientos de los jugadores argentinos en la elite del tenis.
        </p>
      </section>
    </div>
  )
}

export default Ranking
