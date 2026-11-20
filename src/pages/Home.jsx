import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'
import { SEED_NEWS } from '../data/editorialArticles'
import StatusBadge from '../components/common/StatusBadge'
import PlayerFlag from '../components/common/PlayerFlag'
import { parseSetScore, getMatchStatus, USER_TIMEZONE, parseRound, getTodayART, filterEmptySets, isJuniorMatch } from '../utils/tennisHelpers'
import { fetchFromApi } from '../services/tennisApi'
import { useTennis } from '../context/TennisContext'
import { MASTER_TOURNAMENTS } from '../constants/tennis'
import LeagueBlock from '../components/common/LeagueBlock'
import { SkeletonLeagueBlock } from '../components/common/SkeletonLoader'
import SEO from '../components/common/SEO'

const formatDateLabel = (dateStr, isToday, todayART) => {
  if (isToday) return 'HOY';

  const d = new Date(dateStr + 'T12:00:00');
  const t = new Date(todayART + 'T12:00:00');

  const diffDays = Math.round((d - t) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'MAÑANA';
  if (diffDays === -1) return 'AYER';

  return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
}

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { rankingMap, playerProfiles, fetchPlayerProfile } = useTennis();

  const category = searchParams.get('category') || 'ATP';
  const filter = searchParams.get('filter') || 'TODOS';
  const todayART = getTodayART();
  const selectedDate = searchParams.get('date') || todayART;
  const isToday = selectedDate === todayART;
  const [latestNews, setLatestNews] = useState(SEED_NEWS.slice(0, 4));

  useEffect(() => {
    const newsRef = collection(db, 'news');
    const q = query(newsRef, orderBy('publishedAt', 'desc'), limit(4));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fsDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const seen = new Set(fsDocs.map(a => a.slug || a.id));
        const combined = [
          ...fsDocs,
          ...SEED_NEWS.filter(s => !seen.has(s.slug))
        ].slice(0, 4);
        setLatestNews(combined);
      }
    }, () => {});
    return () => unsub();
  }, []);

  const setCategory = (c) => {
    searchParams.set('category', c);
    setSearchParams(searchParams);
  };

  const setFilter = (f) => {
    searchParams.set('filter', f);
    setSearchParams(searchParams);
  };

  const changeDate = (offset) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    searchParams.set('date', d.toISOString().split('T')[0]);
    setSearchParams(searchParams);
  };

  const { data: fixtures = [], isLoading } = useQuery({
    queryKey: ['fixtures', selectedDate],
    queryFn: async () => {
      const [fRes, oRes] = await Promise.all([
        fetchFromApi('get_fixtures', {
          date_start: selectedDate,
          date_stop: selectedDate,
          timezone: USER_TIMEZONE
        }),
        fetchFromApi('get_odds', {
          date_start: selectedDate,
          date_stop: selectedDate
        }).catch(() => ({ success: 0 }))
      ]);

      if (fRes.success !== 1) return [];

      const oddsMap = (oRes && oRes.success === 1 && oRes.result) ? oRes.result : {};

      // Helper to pick the first available odd from any bookmaker
      const getOdd = (homeOrAway) => {
        if (!homeOrAway) return null;
        const bmakers = ['bet365', 'bwin', '1xBet', 'Betano', 'WilliamHill', 'Pncl', 'Sbo'];
        for (const b of bmakers) {
          if (homeOrAway[b]) return homeOrAway[b];
        }
        // Last resort: pick very first bookmaker value available
        const firstKey = Object.keys(homeOrAway)[0];
        return firstKey ? homeOrAway[firstKey] : null;
      };

      return fRes.result.reduce((acc, match) => {
        const type = (match.event_type_type || '').toUpperCase();
        const tNameRaw = (match.tournament_name || '');
        const isJunior = isJuniorMatch(match);

        let matchCategory = 'ATP';
        if (type.includes('DOUBLES') || tNameRaw.toUpperCase().includes('DOUBLES')) {
          matchCategory = 'DOBLES';
        } else if (type.includes('GIRLS') || tNameRaw.toUpperCase().includes('GIRLS') || type.includes('WTA') || type.includes('WOMEN') || /^W\d+/.test(tNameRaw)) {
          matchCategory = 'WTA';
        } else if (type.includes('BOYS') || tNameRaw.toUpperCase().includes('BOYS')) {
          matchCategory = 'ATP';
        }

        let priority = 100, label = '';

        let customCategory = null;
        let tournamentId = null;
        Object.entries(MASTER_TOURNAMENTS).forEach(([cat, tournaments]) => {
          const found = tournaments.find(t => t.apiKey === match.tournament_key?.toString());
          if (found) {
            customCategory = cat;
            tournamentId = found.id;
          }
        });

        const isSlam = customCategory === 'Slams' || type.includes('GRAND SLAM') || (tNameRaw.includes('Open') && /Australian|Roland|Wimbledon|US/.test(tNameRaw));

        if (isJunior) {
          // Torneos Junior se separan con prioridad baja (70/75) para quedar abajo de los profesionales
          priority = isSlam ? 70 : 75;
          label = isSlam ? 'Grand Slam Junior' : 'Junior';
        } else if (isSlam) {
          priority = 10; label = 'Grand Slam';
        } else if (customCategory === 'ATP 1000' || tNameRaw.includes('1000')) {
          priority = 20; label = matchCategory === 'WTA' ? 'WTA 1000' : 'ATP 1000';
        } else if (customCategory === 'ATP 500' || tNameRaw.includes('500')) {
          priority = 30; label = matchCategory === 'WTA' ? 'WTA 500' : 'ATP 500';
        } else if (customCategory === 'ATP 250' || tNameRaw.includes('250')) {
          priority = 40; label = matchCategory === 'WTA' ? 'WTA 250' : 'ATP 250';
        } else if (type.includes('CHALLENGER') || tNameRaw.toLowerCase().includes('challenger')) {
          if (matchCategory === 'DOBLES') return acc;
          priority = 50; label = 'Challenger';
          customCategory = 'Challenger';
          tournamentId = match.tournament_key?.toString();
        } else if (type.includes('ITF') || tNameRaw.match(/^M\d+/) || /^W\d+/.test(tNameRaw)) {
          priority = 60; label = 'ITF';
        } else if (matchCategory === 'WTA') {
          priority = 45; label = 'WTA';
        } else if (type.includes('ATP')) {
          priority = 45; label = 'ATP';
        } else if (matchCategory === 'DOBLES') {
          priority = 45; label = 'DOBLES';
        }

        let cleanName = tNameRaw
          .replace(/\s*-\s*ATP\s*Singles/i, '')
          .replace(/\s*-\s*ATP\s*\d*/i, '')
          .replace(/\s*-\s*WTA\s*Singles/i, '')
          .replace(/\s*-\s*WTA\s*\d*/i, '')
          .replace(/\s*-\s*Doubles/i, '')
          .trim();

        if (isJunior) {
          // Asegurar que el nombre distinga claramente Boys / Girls / Junior para no unificarse con el torneo profesional
          if (!/\b(boys|girls|junior)\b/i.test(cleanName)) {
            if (/\bgirls\b/i.test(type)) cleanName = 'Girls ' + cleanName;
            else if (/\bboys\b/i.test(type)) cleanName = 'Boys ' + cleanName;
            else cleanName = 'Junior ' + cleanName;
          }
        }

        const tDisplayName = label && !cleanName.includes(label) ? `${label} - ${cleanName}` : cleanName;

        if (!acc[tDisplayName]) {
          acc[tDisplayName] = {
            leagueId: match.tournament_key,
            leagueName: tDisplayName,
            priority,
            categoryId: customCategory,
            tournamentId: tournamentId,
            games: []
          };
        }

        const gameScore = match.event_game_result ? match.event_game_result.split(' - ') : ['0', '0'];

        const status = getMatchStatus(match);
        const isFinished = ['FIN', 'RET', 'W/O', 'CANC'].includes(status);

        acc[tDisplayName].games.push({
          id: match.event_key,
          p1Key: match.first_player_key, p2Key: match.second_player_key,
          player1: match.event_first_player, player2: match.event_second_player,
          p1Logo: match.event_first_player_logo, p2Logo: match.event_second_player_logo,
          p1Sets: filterEmptySets(match.scores, status).map(s => s.score_first),
          p2Sets: filterEmptySets(match.scores, status).map(s => s.score_second),
          currentGame: gameScore[0], p2Game: gameScore[1],
          status: status, time: match.event_time || '',
          serving: match.event_serve === 'First Player' ? 1 : (match.event_serve === 'Second Player' ? 2 : 0),
          winner: match.event_winner,
          round: parseRound(match.tournament_round, match.event_qualification === 'True'),
          matchCategory,
          p1Odd: !isFinished ? getOdd(oddsMap[String(match.event_key)]?.['Home/Away']?.Home) : null,
          p2Odd: !isFinished ? getOdd(oddsMap[String(match.event_key)]?.['Home/Away']?.Away) : null
        });
        return acc;
      }, {});
    },
    refetchInterval: isToday ? 30000 : false
  });

  // Pre-fetch profiles for all players displayed (to ensure ARG filter works)
  useEffect(() => {
    if (Object.keys(fixtures).length > 0) {
      Object.values(fixtures).forEach(league => {
        league.games.forEach(game => {
          if (game.p1Key) fetchPlayerProfile(game.p1Key);
          if (game.p2Key) fetchPlayerProfile(game.p2Key);
        });
      });
    }
  }, [fixtures, fetchPlayerProfile]);

  const sortedData = useMemo(() => {
    return Object.values(fixtures)
      .sort((a, b) => a.priority - b.priority)
      .map(league => ({
        ...league,
        games: league.games.filter(game => {
          if (game.matchCategory !== category) return false;

          if (filter === 'VIVO') return game.status === 'LIVE';
          if (filter === 'ARG') {
            const p1 = playerProfiles[game.p1Key];
            const p2 = playerProfiles[game.p2Key];
            return (p1?.code === 'ar' || p2?.code === 'ar');
          }
          return true;
        })
      })).filter(league => league.games.length > 0);
  }, [fixtures, category, filter, playerProfiles]);

  // Removed manual title update in favor of SEO component
  return (
    <>
      <SEO 
        title="Resultados de Tenis en Vivo, ATP y WTA" 
        description="Sigue los resultados de tenis en vivo, rankings ATP y WTA actualizados, y estadísticas de todos los torneos Grand Slam, Masters 1000 y Challenger. Toda la información del tenis argentino."
        keywords="tenis en vivo, resultados de tenis, ranking atp, ranking wta, tenis argentino, doble falta, atp 1000, challenger tour"
        canonicalUrl="/"
      />
      <div className="main-header-block_mainHeader">
        <div className="main-header-block_top-header" style={{ flexDirection: 'column' }}>
          <div className="date-nav">
            <button className="date-nav-arrow" onClick={() => changeDate(-1)}>◀</button>
            <h1>PARTIDOS — <span>{formatDateLabel(selectedDate, isToday, todayART)}</span></h1>
            <button className="date-nav-arrow" onClick={() => changeDate(1)}>▶</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'center' }}>
            <button className={`main-header-block_button ${category === 'ATP' ? 'active' : ''}`} onClick={() => setCategory('ATP')}>ATP</button>
            <button className={`main-header-block_button ${category === 'WTA' ? 'active' : ''}`} onClick={() => setCategory('WTA')}>WTA</button>
            <button className={`main-header-block_button ${category === 'DOBLES' ? 'active' : ''}`} onClick={() => setCategory('DOBLES')}>DOBLES</button>
          </div>
        </div>
        <div className="main-header-block_bottom-header">
          <button className={`main-header-block_button ${filter === 'TODOS' ? 'active' : ''}`} onClick={() => setFilter('TODOS')}>TODOS</button>
          <button className={`main-header-block_button main-header-block_button-red ${filter === 'VIVO' ? 'active' : ''}`} onClick={() => setFilter('VIVO')}>VIVO</button>
          <button className={`main-header-block_button main-header-block_button-arg ${filter === 'ARG' ? 'active' : ''}`} onClick={() => setFilter('ARG')}>🇦🇷 ARG</button>
        </div>
      </div>
      <div className="leagues-container">
        {isLoading ? (
          <>
            <SkeletonLeagueBlock />
            <SkeletonLeagueBlock />
            <SkeletonLeagueBlock />
          </>
        ) : sortedData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>No hay partidos programados.</div>
        ) : (
          sortedData.map(league => (
            <LeagueBlock key={league.leagueName} league={league} />
          ))
        )}
      </div>

      {/* BLOQUE DE ÚLTIMAS CRÓNICAS Y ANÁLISIS DEL TENIS ARGENTINO */}
      <section style={{
        padding: '40px 20px 20px',
        maxWidth: '960px',
        margin: '0 auto',
        color: '#fff'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '22px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '14px'
        }}>
          <div>
            <h2 style={{ color: 'var(--ball-yellow)', margin: '0 0 6px 0', fontSize: '1.45rem' }}>
              Últimas Crónicas y Análisis del Tenis Argentino
            </h2>
            <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem' }}>
              Cobertura periodística diaria de la Legión Argentina, historia, táctica y guías del circuito ATP y WTA.
            </p>
          </div>
          <Link
            to="/noticias"
            style={{
              background: 'rgba(212, 235, 0, 0.12)',
              color: 'var(--ball-yellow)',
              padding: '8px 16px',
              borderRadius: '20px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: '1px solid rgba(212, 235, 0, 0.3)'
            }}
          >
            Ver todas las noticias →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '18px'
        }}>
          {latestNews.map((item) => (
            <article
              key={item.slug || item.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {item.imageUrl && (
                <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(18,20,23,0.88)',
                    color: 'var(--ball-yellow)',
                    padding: '3px 9px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: '700'
                  }}>
                    {item.category || 'Tenis Argentino'}
                  </span>
                </div>
              )}
              <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#888', marginBottom: '6px' }}>
                  {item.publishedAt} • {item.readTime || '5 min'}
                </span>
                <h3 style={{ fontSize: '1.02rem', lineHeight: '1.38', margin: '0 0 10px 0' }}>
                  <Link
                    to={`/noticias/${item.slug || item.id}`}
                    state={{ article: item }}
                    style={{ color: '#fff', textDecoration: 'none' }}
                  >
                    {item.title}
                  </Link>
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#aaa', lineHeight: '1.55', margin: '0 0 12px 0', flexGrow: 1 }}>
                  {item.excerpt}
                </p>
                <Link
                  to={`/noticias/${item.slug || item.id}`}
                  state={{ article: item }}
                  style={{
                    color: 'var(--ball-yellow)',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    marginTop: 'auto'
                  }}
                >
                  Leer nota completa →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECCIÓN DE CONTENIDO EDITORIAL Y GUÍA DEL CIRCUITO */}
      <section className="static-about-section" style={{ 
        padding: '45px 20px 60px', 
        maxWidth: '900px', 
        margin: '0 auto', 
        color: '#ccc',
        lineHeight: '1.8',
        fontSize: '0.95rem'
      }}>
        <h2 style={{ color: 'var(--ball-yellow)', marginBottom: '18px', fontSize: '1.5rem' }}>
          Cobertura Integral de Tenis en Vivo, Estadísticas y Seguimiento de la Legión Argentina
        </h2>
        <p style={{ marginBottom: '15px' }}>
          Bienvenido a <strong>DobleFalta</strong>, plataforma especializada en el análisis periodístico y estadístico del circuito mundial de tenis. Nuestro portal combina el seguimiento en tiempo real de todos los certámenes de la <strong>ATP (Asociación de Tenistas Profesionales)</strong> y la <strong>WTA (Women's Tennis Association)</strong> con crónicas diarias dedicadas a los representantes argentinos en cada rincón del planeta.
        </p>
        <p style={{ marginBottom: '15px' }}>
          A través de nuestro filtro exclusivo <strong>🇦🇷 ARG</strong>, cualquier aficionado puede identificar al instante los encuentros programados, en juego y finalizados de tenistas como Francisco Cerúndolo, Sebastián Báez, Tomás Martín Etcheverry, Mariano Navone, Facundo Díaz Acosta, Camilo Ugo Carabelli, Federico Coria, Nadia Podoroska, María Lourdes Carlé, Julia Riera y Solana Sierra, tanto en los torneos de élite como en la gira sudamericana del <strong>ATP Challenger Tour</strong>.
        </p>
        <p style={{ marginBottom: '25px' }}>
          Cada ficha de partido ofrece el desglose punto a punto, porcentajes de efectividad con el primer y segundo servicio, oportunidades de quiebre (<em>break points</em>) convertidas, historial de enfrentamientos previos (<em>Head-to-Head</em>) y la proyección matemática directa en el <Link to="/ranking/en-vivo" style={{ color: 'var(--ball-yellow)' }}>Ranking ATP y WTA en Vivo</Link>.
        </p>

        <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px', fontSize: '1.25rem' }}>
          Estructura y Jerarquía de los Torneos Profesionales
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.92rem' }}>
          <li style={{ marginBottom: '15px' }}>
            <strong>• Grand Slams (2.000 puntos):</strong> Los cuatro monumentos históricos del tenis mundial: <em>Australian Open</em> (cemento en Melbourne), <em>Roland Garros</em> (polvo de ladrillo en París), <em>Wimbledon</em> (césped natural en Londres) y <em>US Open</em> (cemento en Nueva York). Con cuadros principales de 128 singlistas y partidos al mejor de cinco sets en la rama masculina, consagran la máxima gloria deportiva.
          </li>
          <li style={{ marginBottom: '15px' }}>
            <strong>• ATP Masters 1000 y WTA 1000 (1.000 puntos):</strong> Nueve citas obligatorias del calendario masculino (Indian Wells, Miami, Montecarlo, Madrid, Roma, Canadá, Cincinnati, Shanghái y París-Bercy) donde se reúnen sin excepción las mejores raquetas del ranking mundial.
          </li>
          <li style={{ marginBottom: '15px' }}>
            <strong>• ATP 500 y ATP 250:</strong> El corazón competitivo de cada semana, incluyendo paradas emblemáticas de nuestra región como el <strong>Argentina Open</strong> en el Buenos Aires Lawn Tennis Club, el Río Open en Brasil y el Abierto de Santiago.
          </li>
          <li style={{ marginBottom: '15px' }}>
            <strong>• ATP Challenger Tour e ITF World Tennis Tour:</strong> El verdadero semillero del tenis profesional. Con categorías Challenger 50, 75, 100, 125 y 175, es el circuito donde los jugadores jóvenes y los tenistas ubicados entre el puesto 80 y 300 construyen su ascenso hacia el Top 100.
          </li>
        </ul>

        <div style={{
          marginTop: '28px',
          padding: '18px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.07)'
        }}>
          <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '1.05rem' }}>
            Guías e Informes Especiales de DobleFalta
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.88rem' }}>
            <Link to="/noticias/como-funciona-sistema-puntos-ranking-atp" style={{ color: 'var(--ball-yellow)' }}>• Cómo funciona el Ranking ATP</Link>
            <Link to="/noticias/guillermo-vilas-legado-historia-tenis-argentino" style={{ color: 'var(--ball-yellow)' }}>• El legado de Guillermo Vilas</Link>
            <Link to="/noticias/copa-davis-2016-zagreb-hazana-historica-argentina" style={{ color: 'var(--ball-yellow)' }}>• La hazaña de la Copa Davis 2016</Link>
            <Link to="/noticias/superficies-tenis-diferencias-estrategia-rebote" style={{ color: 'var(--ball-yellow)' }}>• Física y táctica de las superficies</Link>
            <Link to="/noticias/circuito-challenger-sudamerica-semillero-tenis-argentino" style={{ color: 'var(--ball-yellow)' }}>• El circuito Challenger en Sudamérica</Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
