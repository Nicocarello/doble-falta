import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchFromApi } from '../services/tennisApi';
import PlayerFlag from '../components/common/PlayerFlag';
import { useTennis } from '../context/TennisContext';

const PlayerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { atpRankings, wtaRankings } = useTennis();
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getPlayer = async () => {
      try {
        setLoading(true);
        const data = await fetchFromApi('get_players', { player_key: id });
        if (data.success && data.result && data.result.length > 0) {
          setPlayerInfo(data.result[0]);
          document.title = `${data.result[0].player_name} - Perfil | DobleFalta`;
        } else {
          setError('No se encontró el perfil del jugador.');
        }
      } catch (err) {
        setError('Error al cargar datos del jugador.');
      } finally {
        setLoading(false);
      }
    };
    getPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-view" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
        <div className="skeleton-base" style={{ width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto 20px' }}></div>
        <div className="skeleton-base" style={{ width: '200px', height: '30px', margin: '0 auto 10px' }}></div>
        <div className="skeleton-base" style={{ width: '100px', height: '20px', margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error || !playerInfo) {
    return (
      <div className="detail-view" style={{ padding: '40px', textAlign: 'center', color: '#ff5252' }}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>← VOLVER</button>
        <p>{error || 'Jugador no encontrado'}</p>
      </div>
    );
  }

  // Filtrar estadísticas recientes (Singles)
  const singlesStats = playerInfo.stats ? playerInfo.stats.filter(s => s.type === 'singles').sort((a, b) => b.season - a.season) : [];
  const doublesStats = playerInfo.stats ? playerInfo.stats.filter(s => s.type === 'doubles').sort((a, b) => b.season - a.season) : [];

  // Calcular edad
  const calculateAge = (bdayDDMMYYYY) => {
    if (!bdayDDMMYYYY) return null;
    const parts = bdayDDMMYYYY.split('.');
    if (parts.length !== 3) return null;
    const dob = new Date(parts[2], parts[1] - 1, parts[0]);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };
  const age = calculateAge(playerInfo.player_bday);

  // Encontrar ranking en vivo
  const currentRank = atpRankings.find(r => String(r.player_key) === String(id)) ||
    wtaRankings.find(r => String(r.player_key) === String(id));

  // Mejor ranking histórico y Profesionalismo
  const allRanks = singlesStats.filter(s => s.rank && !isNaN(s.rank)).map(s => parseInt(s.rank));
  const bestRank = allRanks.length > 0 ? Math.min(...allRanks) : null;

  const allSeasons = (playerInfo.stats || []).filter(s => s.season && !isNaN(s.season)).map(s => parseInt(s.season));
  const earliestSeason = allSeasons.length > 0 ? Math.min(...allSeasons) : null;
  const latestSeason = allSeasons.length > 0 ? Math.max(...allSeasons) : null;
  const yearsActive = earliestSeason && latestSeason ? latestSeason - earliestSeason + 1 : null;

  // Calcular stats de carrera (sumando todas las temporadas)
  const totalSinglesWins = singlesStats.reduce((acc, s) => acc + parseInt(s.matches_won || 0), 0);
  const totalSinglesLosses = singlesStats.reduce((acc, s) => acc + parseInt(s.matches_lost || 0), 0);
  const totalSinglesTitles = singlesStats.reduce((acc, s) => acc + parseInt(s.titles || 0), 0);
  const totalDoublesTitles = doublesStats.reduce((acc, s) => acc + parseInt(s.titles || 0), 0);

  // Calcular stats historicas por superficie (Singles)
  const totalHardWins = singlesStats.reduce((acc, s) => acc + parseInt(s.hard_won || 0), 0);
  const totalHardLosses = singlesStats.reduce((acc, s) => acc + parseInt(s.hard_lost || 0), 0);
  const totalClayWins = singlesStats.reduce((acc, s) => acc + parseInt(s.clay_won || 0), 0);
  const totalClayLosses = singlesStats.reduce((acc, s) => acc + parseInt(s.clay_lost || 0), 0);
  const totalGrassWins = singlesStats.reduce((acc, s) => acc + parseInt(s.grass_won || 0), 0);
  const totalGrassLosses = singlesStats.reduce((acc, s) => acc + parseInt(s.grass_lost || 0), 0);

  return (
    <div className="detail-view fade-in" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '30px' }}>← VOLVER</button>

      {/* HEADER DEL JUGADOR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '30px',
        backgroundColor: 'var(--bg-card)',
        padding: '30px',
        borderRadius: '12px',
        borderLeft: '4px solid var(--ball-yellow)',
        flexWrap: 'wrap'
      }}>
        {playerInfo.player_logo ? (
          <img
            src={playerInfo.player_logo}
            alt={playerInfo.player_name}
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
            👤
          </div>
        )}

        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', color: 'var(--ball-yellow)' }}>
            {playerInfo.player_full_name || playerInfo.player_name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', color: '#ccc', marginBottom: '20px', flexWrap: 'wrap' }}>
            <PlayerFlag playerKey={id} />
            <span>{playerInfo.player_country}</span>
            {age && <span>• {age} años <span style={{ fontSize: '0.8rem', color: '#888' }}>({playerInfo.player_bday})</span></span>}
            {yearsActive && <span>• Profesional desde {earliestSeason} <span style={{ fontSize: '0.8rem', color: '#888' }}>({yearsActive} años)</span></span>}
          </div>

          {/* STATS GLOBALES */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {currentRank && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Ranking Actual</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  #{currentRank.place} <span style={{ fontSize: '0.9rem', color: '#aaa' }}>({parseInt(currentRank.points).toLocaleString()} pts)</span>
                </div>
              </div>
            )}

            {bestRank && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Mejor Ranking</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--ball-yellow)' }}>
                  #{bestRank}
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Títulos Prof.</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {totalSinglesTitles + totalDoublesTitles}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Historial Singles</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span style={{ color: '#00e676' }}>{totalSinglesWins} V</span> - <span style={{ color: '#ff5252' }}>{totalSinglesLosses} D</span>
                <span style={{ color: '#666', fontSize: '0.9rem', marginLeft: '8px' }}>({totalSinglesWins + totalSinglesLosses} jugados)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RENDIMIENTO POR SUPERFICIE */}
      {(totalHardWins > 0 || totalClayWins > 0 || totalGrassWins > 0) && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>
            Rendimiento por Superficie (Histórico)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {/* Cancha Dura */}
            <div style={{ background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))', border: '1px solid rgba(33, 150, 243, 0.2)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#64b5f6' }}>Cemento</h3>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                <span style={{ color: '#00e676' }}>{totalHardWins} V</span> - <span style={{ color: '#ff5252' }}>{totalHardLosses} D</span>
              </div>
              <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '8px' }}>
                {totalHardWins + totalHardLosses > 0 ? Math.round((totalHardWins / (totalHardWins + totalHardLosses)) * 100) : 0}% efectividad
              </div>
            </div>

            {/* Polvo de Ladrillo */}
            <div style={{ background: 'linear-gradient(135deg, rgba(230, 81, 0, 0.1), rgba(230, 81, 0, 0.05))', border: '1px solid rgba(230, 81, 0, 0.2)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#ffb74d' }}>Polvo de Ladrillo</h3>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                <span style={{ color: '#00e676' }}>{totalClayWins} V</span> - <span style={{ color: '#ff5252' }}>{totalClayLosses} D</span>
              </div>
              <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '8px' }}>
                {totalClayWins + totalClayLosses > 0 ? Math.round((totalClayWins / (totalClayWins + totalClayLosses)) * 100) : 0}% efectividad
              </div>
            </div>

            {/* Césped */}
            <div style={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))', border: '1px solid rgba(76, 175, 80, 0.2)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#81c784' }}>Césped</h3>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                <span style={{ color: '#00e676' }}>{totalGrassWins} V</span> - <span style={{ color: '#ff5252' }}>{totalGrassLosses} D</span>
              </div>
              <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '8px' }}>
                {totalGrassWins + totalGrassLosses > 0 ? Math.round((totalGrassWins / (totalGrassWins + totalGrassLosses)) * 100) : 0}% efectividad
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTADÍSTICAS RECIENTES */}
      {(singlesStats.length > 0 || doublesStats.length > 0) && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>
            Últimas Temporadas (Singles)
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {singlesStats.slice(0, 3).map((stat, idx) => (
              <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--ball-yellow)' }}>Temporada {stat.season}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#aaa' }}>Rank:</span>
                  <strong>{stat.rank || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#aaa' }}>Victorias:</span>
                  <strong style={{ color: '#00e676' }}>{stat.matches_won || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#aaa' }}>Derrotas:</span>
                  <strong style={{ color: '#ff5252' }}>{stat.matches_lost || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#aaa' }}>🏆Títulos🏆:</span>
                  <strong>{stat.titles || 0}</strong>
                </div>

                {/* Subgrid de Superficie */}
                <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', textAlign: 'center' }}>
                    <div title="Cancha Dura">
                      <div style={{ color: '#64b5f6', marginBottom: '3px' }}>Dura</div>
                      <div><span style={{ color: '#00e676' }}>{stat.hard_won || 0}</span>-<span style={{ color: '#ff5252' }}>{stat.hard_lost || 0}</span></div>
                    </div>
                    <div title="Polvo de Ladrillo" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: '#ffb74d', marginBottom: '3px' }}>Arcilla</div>
                      <div><span style={{ color: '#00e676' }}>{stat.clay_won || 0}</span>-<span style={{ color: '#ff5252' }}>{stat.clay_lost || 0}</span></div>
                    </div>
                    <div title="Césped">
                      <div style={{ color: '#81c784', marginBottom: '3px' }}>Césped</div>
                      <div><span style={{ color: '#00e676' }}>{stat.grass_won || 0}</span>-<span style={{ color: '#ff5252' }}>{stat.grass_lost || 0}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!playerInfo.stats || playerInfo.stats.length === 0) && (
        <div style={{ marginTop: '40px', textAlign: 'center', color: '#888', padding: '30px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          No hay estadísticas detalladas disponibles para este jugador en este momento.
        </div>
      )}
    </div>
  );
};

export default PlayerDetail;
