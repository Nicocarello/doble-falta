import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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

      {/* SECCIÓN DE CONTENIDO ESTÁTICO (PARA ADSENSE/SEO) */}
      <section className="static-about-section" style={{ 
        padding: '60px 20px', 
        maxWidth: '800px', 
        margin: '0 auto', 
        color: '#ccc',
        lineHeight: '1.8',
        fontSize: '0.95rem'
      }}>
        <h2 style={{ color: 'var(--ball-yellow)', marginBottom: '20px', fontSize: '1.5rem' }}>Resultados de Tenis en Vivo y Estadísticas</h2>
        <p style={{ marginBottom: '15px' }}>
          Bienvenido a <strong>DobleFalta</strong>, tu portal dedicado a la cobertura integral del circuito profesional de tenis. 
          Aquí encontrarás resultados en tiempo real, cuadros detallados y rankings actualizados de la <strong>ATP (Asociación de Tenistas Profesionales)</strong> y la <strong>WTA (Women's Tennis Association)</strong>.
        </p>
        <p style={{ marginBottom: '15px' }}>
          Nuestro sistema se sincroniza constantemente para ofrecerte los marcadores minuto a minuto de los eventos más importantes del año, desde los <strong>Grand Slams</strong> (Australian Open, Roland Garros, Wimbledon y US Open) hasta los torneos <strong>Masters 1000</strong>, 500 y 250. 
        </p>
        <p style={{ marginBottom: '25px' }}>
          Además, brindamos un seguimiento especial a los tenistas argentinos y latinoamericanos en el circuito <strong>Challenger</strong>, asegurando que la comunidad tenga acceso a información precisa sobre el desarrollo del deporte blanco a nivel global.
        </p>

        <h3 style={{ color: 'var(--ball-yellow)', marginBottom: '15px', fontSize: '1.2rem' }}>Guía de Categorías de Torneos</h3>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
          <li style={{ marginBottom: '15px' }}>
            <strong>• Grand Slams:</strong> Los cuatro torneos más importantes (Australia, Roland Garros, Wimbledon, US Open). Otorgan 2000 puntos y se juegan a 5 sets en hombres.
          </li>
          <li style={{ marginBottom: '15px' }}>
            <strong>• Masters 1000:</strong> Nueve torneos de elite que siguen en importancia a los Slams. Clave para el ranking mundial.
          </li>
          <li style={{ marginBottom: '15px' }}>
            <strong>• ATP 500 / 250:</strong> Torneos regulares del circuito donde los jugadores suman puntos semana a semana.
          </li>
          <li style={{ marginBottom: '10px' }}>
            <strong>• Challenger Tour:</strong> El "semillero" del tenis. Aquí es donde los jugadores argentinos suelen dar el salto al Top 100 mundial.
          </li>
        </ul>
      </section>
    </>
  )
}

export default Home
