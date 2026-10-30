import { TwitterApi } from 'twitter-api-v2';
import fetch from 'node-fetch';

/**
 * BOT DE TWITTER PARA DOBLE FALTA
 * Automatiza un tweet diario con la agenda de los tenistas argentinos.
 */

// API Key de Tenis (de src/services/tennisApi.js)
const TENNIS_API_KEY = '794aa343676faedea5f7cf4c6a311f1627eadda8de2e774afa49d615dedd23f8';
const TENNIS_API_URL = 'https://api.api-tennis.com/tennis/';

// Configuración de Twitter (vía Variable de Entorno)
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function fetchFromApi(method, params = {}) {
  const query = new URLSearchParams({ method, APIkey: TENNIS_API_KEY, ...params }).toString();
  const res = await fetch(`${TENNIS_API_URL}?${query}`);
  return res.json();
}

const playerCache = new Map();

async function isArgentinian(playerKey, playerName) {
  if (!playerKey) return false;
  
  // Cache para no quemar la API llamando 10 veces al mismo jugador
  if (playerCache.has(playerKey)) return playerCache.get(playerKey);

  // Lista rápida de nombres comunes para ahorrar llamadas a la API
  const commonArgs = ['Cerundolo', 'Baez', 'Etcheverry', 'Navone', 'Diaz Acosta', 'Coria', 'Schwartzman', 'Podoroska', 'Sierra'];
  if (commonArgs.some(name => playerName.includes(name))) {
    playerCache.set(playerKey, true);
    return true;
  }

  try {
    const res = await fetchFromApi('get_players', { player_key: playerKey });
    const isArg = res.success === 1 && res.result?.[0]?.player_country === 'Argentina';
    playerCache.set(playerKey, isArg);
    return isArg;
  } catch (e) {
    return false;
  }
}

async function run() {
  try {
    // 1. Fecha de hoy en Argentina (ART)
    const now = new Date();
    const options = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const todayStr = formatter.format(now); // yyyy-mm-dd

    console.log(`Iniciando bot para el día: ${todayStr}`);

    // 2. Obtener todos los partidos de hoy
    const fixtures = await fetchFromApi('get_fixtures', { 
      date_start: todayStr, 
      date_stop: todayStr 
    });

    if (fixtures.success !== 1 || !fixtures.result) {
      console.log("No se encontraron partidos.");
      return;
    }

    // 3. Filtrar partidos donde haya al menos un argentino
    const argMatches = [];
    for (const match of fixtures.result) {
      const p1IsArg = await isArgentinian(match.first_player_key, match.event_first_player);
      const p2IsArg = await isArgentinian(match.second_player_key, match.event_second_player);

      if (p1IsArg || p2IsArg) {
        argMatches.push(match);
      }
    }

    if (argMatches.length === 0) {
      console.log("Hoy no juegan argentinos.");
      return;
    }

    // 4. Armar el texto del Tweet
    const dateFormatted = todayStr.split('-').reverse().join('/');
    let tweetText = `🇦🇷 ¡Agenda de Argentinos hoy! (${dateFormatted})\n\n`;
    
    // Mostramos máximo 4-5 partidos para no pasarnos del límite de caracteres
    const matchesToShow = argMatches.slice(0, 5);
    
    matchesToShow.forEach(m => {
      const time = m.event_time || 'TBD';
      const tournament = m.tournament_name.split(' - ')[0].trim();
      tweetText += `🎾 ${m.event_first_player} vs ${m.event_second_player}\n`;
      tweetText += `🏆 ${tournament} | ⏰ ${time}\n\n`;
    });

    if (argMatches.length > 5) {
      tweetText += `...y ${argMatches.length - 5} partidos más.\n\n`;
    }

    tweetText += `Seguí los scores en: doblefaltatenis.com.ar #Tenis #ATP #Argentina`;

    // Recortar si se pasa del límite de Twitter (280)
    if (tweetText.length > 280) {
      tweetText = tweetText.substring(0, 277) + "...";
    }

    console.log("Publicando tweet:\n", tweetText);

    // 5. Publicar
    await twitterClient.v2.tweet(tweetText);
    console.log("¡Tweet enviado con éxito!");

  } catch (error) {
    console.error("Error ejecutando el bot:", error);
    process.exit(1);
  }
}

run();
