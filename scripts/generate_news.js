import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');

// 1. Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyB91DcrQp1yz3pWsppvk0MiVkrngCopSy0',
  authDomain: 'doble-falta.firebaseapp.com',
  projectId: 'doble-falta',
  storageBucket: 'doble-falta.firebasestorage.app',
  messagingSenderId: '470042716099',
  appId: '1:470042716099:web:edfccd9d3fe365c1573f76'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Configuración de API Tennis y Gemini
const TENNIS_API_KEY = process.env.TENNIS_API_KEY || 'fe9048681f0c0f8b24d25ef4b97e18ea428e443e1ad866a4ffdfc96bdc9e73b0';
const TENNIS_API_URL = 'https://api.api-tennis.com/tennis/';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Dominios de bancos con marcas de agua visibles que debemos excluir
const WATERMARK_DOMAINS = [
  'alamy.com', 'gettyimages.', 'shutterstock.', 'depositphotos.',
  'dreamstime.', '123rf.', 'istockphoto.', 'vecteezy.', 'freepik.'
];

// Respaldo de fotos reales de tenistas argentinos en competencia
const FALLBACK_ARG_PHOTOS = [
  'https://www.lanacion.com.ar/resizer/v2/el-tenista-argentino-francisco-cerundolo-42FPE22CINAWLIQUFY4VWGQVJM.jpeg?auth=332bdf3e2e95f99f8c3818d13387b5adbb9e2ee2d148c53d6447b213e8de8285&width=1200&height=800&quality=70&smart=false&focal=473,257',
  'https://s.rfi.fr/media/display/b6ebb5b2-022b-11ee-968a-005056a90284/AP23152363662495.jpg',
  'https://lagazzettadf.com/wp-content/uploads/2024/07/triunfo-epico-de-sebastian-baez-en-grand-slam-focus-0-0-1044-675.jpg',
  'https://www.lanacion.com.ar/resizer/v2/camilo-ugo-carabelli-con-el-trofeo-de-campeon-del-56KBQOLMAFCCRH234L4KGFLSEQ.jpg?auth=52a8f37df2cd33476a0740796b115fb3e5d39de4e4c97a2238562022d732851f&width=1200&height=800&quality=70&smart=true',
  'https://www.lanacion.com.ar/resizer/v2/el-desahogo-del-tenista-argentino-federico-coria-NB5NTFWUKBHS3C7N4TRRDPY7QY.JPG?auth=882489452911af0d41dd90ca5879f6861d5c14dbb868f7ef3a33a351872ac02b&width=1200&height=800&quality=70&smart=false&focal=1120,259',
  'https://www.lanacion.com.ar/resizer/v2/julia-riera-al-saque-en-rabat-vive-la-mejor-PBA4W2LJPVGILCOL34SSWQL5N4.jpg?auth=1d9ff5bf3281d6e7e71a7ef15136f60dfd6d69d5d194cf37978833339bf6791b&width=1200&height=800&quality=70&smart=true'
];

// Diccionario de nombres completos para mejorar la precisión periodística y la búsqueda de fotos reales
const PLAYER_FULL_NAMES = {
  'f. cerundolo': 'Francisco Cerúndolo',
  'j. m. cerundolo': 'Juan Manuel Cerúndolo',
  's. baez': 'Sebastián Báez',
  't. m. etcheverry': 'Tomás Martín Etcheverry',
  'm. navone': 'Mariano Navone',
  'f. comesana': 'Francisco Comesaña',
  'c. ugo carabelli': 'Camilo Ugo Carabelli',
  'f. diaz acosta': 'Facundo Díaz Acosta',
  't. a. tirante': 'Thiago Agustín Tirante',
  'f. coria': 'Federico Coria',
  'd. schwartzman': 'Diego Schwartzman',
  'j. p. ficovich': 'Juan Pablo Ficovich',
  'n. kicker': 'Nicolás Kicker',
  'g. villanueva': 'Gonzalo Villanueva',
  'r. olivo': 'Renzo Olivo',
  'h. casanova': 'Hernán Casanova',
  'l. midon': 'Lautaro Midón',
  'l. e. ambrogi': 'Luciano Ambrogi',
  's. rodriguez taverna': 'Santiago Rodríguez Taverna',
  'r. a. burruchaga': 'Román Burruchaga',
  'r. burruchaga': 'Román Burruchaga',
  'n. podoroska': 'Nadia Podoroska',
  'm. l. carle': 'María Lourdes Carlé',
  'j. riera': 'Julia Riera',
  's. sierra': 'Solana Sierra',
  'm. capurro taborda': 'Martina Capurro Taborda',
  'j. ortenzi': 'Jazmín Ortenzi',
  'h. zeballos': 'Horacio Zeballos',
  'f. zeballos': 'Federico Zeballos',
  'm. gonzalez': 'Máximo González',
  'a. molteni': 'Andrés Molteni',
  'f. bagnis': 'Facundo Bagnis',
  'i. monzon': 'Ignacio Monzón',
  't. farjat': 'Tomás Farjat',
  'v. aboian': 'Valerio Aboian',
  'g. a. olivieri': 'Genaro Alberto Olivieri',
  'j. m. la serna': 'Juan Manuel La Serna',
  'a. collarini': 'Andrea Collarini',
  'f. mena': 'Facundo Mena',
  'g. andreozzi': 'Guido Andreozzi',
  'g. duran': 'Guillermo Durán'
};

const KNOWN_ARG_PLAYERS = [
  'cerundolo', 'baez', 'etcheverry', 'navone', 'comesana', 'ugo carabelli',
  'diaz acosta', 'tirante', 'coria', 'schwartzman', 'ficovich', 'kicker',
  'villanueva', 'olivo', 'casanova', 'midon', 'ambrogi', 'rodriguez taverna',
  'burruchaga', 'podoroska', 'carle', 'riera', 'sierra', 'capurro', 'ortenzi',
  'zeballos', 'gonzalez', 'molteni', 'bagnis', 'monterrubini', 'monzon',
  'descotte', 'farjat', 'estabee', 'valerio', 'lingua', 'aboian', 'perez contri',
  'galdos', 'paz', 'mena', 'olivieri', 'la serna', 'zeitune', 'del pino',
  'kestelboim', 'duran', 'andreozzi', 'collarini'
];

function normalize(str = '') {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function expandPlayerName(rawName = '') {
  const clean = rawName.trim();
  const key = normalize(clean);
  if (PLAYER_FULL_NAMES[key]) return PLAYER_FULL_NAMES[key];
  if (clean.includes('/')) {
    return clean.split('/').map(p => expandPlayerName(p.trim())).join(' / ');
  }
  return clean;
}

function isArgPlayer(name) {
  if (!name) return false;
  const lower = normalize(name);
  // Evitar falsos positivos de jugadoras extranjeras o bolivianos
  if (lower.includes('herazo gonzalez') || lower.includes('reasco gonzalez') || lower.includes('f. zeballos')) return false;
  return KNOWN_ARG_PLAYERS.some(k => lower.includes(k));
}

function ensureUrlInSitemap(slug, dateStr) {
  try {
    if (!fs.existsSync(SITEMAP_PATH)) return;
    const xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const targetUrl = `https://doblefaltatenis.com.ar/noticias/${slug}`;
    if (xml.includes(targetUrl)) return;

    const newEntry = `  <url>\n    <loc>${targetUrl}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    const updatedXml = xml.replace('</urlset>', `${newEntry}</urlset>`);
    fs.writeFileSync(SITEMAP_PATH, updatedXml, 'utf-8');
    console.log(`🗺️ Sitemap actualizado con: ${targetUrl}`);
  } catch (err) {
    console.warn('⚠️ No se pudo actualizar public/sitemap.xml:', err.message);
  }
}

function getArgentinaDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const options = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(d);
}

function formatHumanDate(dateStr) {
  const dateObj = new Date(`${dateStr}T12:00:00`);
  return dateObj.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

function hashDate(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  return h;
}

function cleanTournamentName(rawName) {
  if (!rawName) return 'Circuito Internacional';
  return rawName
    .replace(/\s*-\s*ATP\s*Singles/i, '')
    .replace(/\s*-\s*WTA\s*Singles/i, '')
    .replace(/\s*-\s*Qualification/i, ' (Qualy)')
    .trim();
}

// Calcular jerarquía del partido para priorizar Grand Slams, Masters 1000, ATP, WTA y finales en el titular y la foto
function getMatchPrestige(m) {
  let score = 0;
  if (m.argWon) score += 500;
  if (m.isFinal) score += 300;
  if (!m.isDoubles) score += 120;

  const t = `${m.tournament} ${m.eventType}`.toLowerCase();
  if (/paris|vienna|stockholm|metz|atp|grand slam|roland|wimbledon|us open|australian|indian wells|miami|madrid|rome/.test(t)) {
    score += 250;
  } else if (/wta|cali|queretaro|curitiba|sopo|merida/.test(t)) {
    score += 180;
  } else if (/challenger|sauipe|villa maria|guayaquil|lima|montevideo|buenos aires|campinas/.test(t)) {
    score += 140;
  } else {
    score += 50; // M25 / M15 / W15
  }
  return score;
}

async function isImageAccessible(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timer);
    const ct = res.headers.get('content-type') || '';
    return res.ok && ct.startsWith('image/');
  } catch {
    return false;
  }
}

async function searchBingVerifiedPhoto(query, surnameKeyword, usedImagesSet) {
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8'
      }
    });
    const html = await res.text();
    const blocks = [...html.matchAll(/\bm="(\{[^"]+\})"/g)].map(m => {
      try {
        return JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
      } catch {
        return null;
      }
    }).filter(Boolean);

    const kw = normalize(surnameKeyword);
    for (const b of blocks) {
      if (!b.murl || !/^https:\/\/.+\.(jpg|jpeg|png|webp)/i.test(b.murl)) continue;
      if (usedImagesSet.has(b.murl)) continue;
      if (WATERMARK_DOMAINS.some(d => b.murl.toLowerCase().includes(d))) continue;

      const textToCheck = normalize(`${b.t || ''} ${b.desc || ''} ${b.murl || ''} ${b.purl || ''}`);
      if (!textToCheck.includes(kw)) continue;
      if (textToCheck.includes('papa francisco') || textToCheck.includes('franco')) continue;

      if (await isImageAccessible(b.murl)) {
        return { url: b.murl, caption: b.t || query };
      }
    }
  } catch (err) {
    console.warn(`⚠️ Error buscando foto para "${query}":`, err.message);
  }
  return null;
}

// Buscador inteligente de foto contextual del jugador protagonista y el torneo
async function findContextualMatchPhoto(argMatches, dateStr, usedImagesSet = new Set()) {
  const candidates = [...argMatches].sort((a, b) => b.prestige - a.prestige);

  for (const match of candidates.slice(0, 4)) {
    const primaryPlayer = match.fullArgName.split('/')[0].trim();
    const surname = primaryPlayer.split(' ').slice(-1)[0];
    const cleanVenue = match.tournament.replace(/\s*\(Qualy\)/i, '').replace(/^[MW]\d+\s*/i, '').trim();

    const queries = [];
    if (match.argWon && match.isFinal) {
      queries.push(`${primaryPlayer} ${cleanVenue} campeon trofeo tenis`);
      queries.push(`${primaryPlayer} campeon trofeo festejo tenis`);
    }
    if (match.argWon) {
      queries.push(`${primaryPlayer} ${cleanVenue} tenista argentino festejo`);
      queries.push(`${primaryPlayer} tenista argentino festejo ATP`);
    } else {
      queries.push(`${primaryPlayer} ${cleanVenue} tenista argentino`);
      queries.push(`${primaryPlayer} tenista argentino ATP`);
    }

    for (const q of queries) {
      const found = await searchBingVerifiedPhoto(q, surname, usedImagesSet);
      if (found) {
        console.log(`📸 Foto contextual verificada para ${primaryPlayer} (${cleanVenue}): ${found.url}`);
        usedImagesSet.add(found.url);
        return found.url;
      }
    }
  }

  const fallback = FALLBACK_ARG_PHOTOS[hashDate(dateStr) % FALLBACK_ARG_PHOTOS.length];
  return fallback;
}

async function fetchFixtures(dateStr) {
  const query = new URLSearchParams({
    method: 'get_fixtures',
    APIkey: TENNIS_API_KEY,
    date_start: dateStr,
    date_stop: dateStr
  }).toString();

  const res = await fetch(`${TENNIS_API_URL}?${query}`);
  if (!res.ok) throw new Error(`Tennis API error: ${res.statusText}`);
  const data = await res.json();
  return data.result || [];
}

function parseArgMatches(matches) {
  const argMatches = [];

  for (const m of matches) {
    const isP1Arg = isArgPlayer(m.event_first_player);
    const isP2Arg = isArgPlayer(m.event_second_player);

    if (!isP1Arg && !isP2Arg) continue;

    const isFinished = m.event_status === 'Finished' || m.event_status === 'Retired' || m.event_status === 'After Pen.';
    if (!isFinished) continue;

    const rawArgName = isP1Arg ? m.event_first_player : m.event_second_player;
    const rawOpponent = isP1Arg ? m.event_second_player : m.event_first_player;
    const argWon = isP1Arg ? m.event_winner === 'First Player' : m.event_winner === 'Second Player';

    const scoresList = (m.scores || []).map(s => {
      const a = String(isP1Arg ? s.score_first : s.score_second).split('.')[0];
      const b = String(isP1Arg ? s.score_second : s.score_first).split('.')[0];
      return `${a}-${b}`;
    });
    const scoreStr = scoresList.length > 0 ? scoresList.join(', ') : (m.event_final_result || 'Final');

    const isDoubles = rawArgName.includes('/') || rawOpponent.includes('/') || (m.event_type_type || '').toLowerCase().includes('doubles');
    const roundStr = (m.tournament_round || '').toLowerCase();
    const isQualy = (m.tournament_name || '').toLowerCase().includes('qualification') || roundStr.includes('qualification') || String(m.event_qualification).toLowerCase() === 'true';
    const isFinal = !isQualy && roundStr.includes('final') && !roundStr.includes('semi') && !roundStr.includes('quarter') && !roundStr.includes('1/');

    const item = {
      tournament: cleanTournamentName(m.tournament_name),
      rawTournament: m.tournament_name || 'Torneo Internacional',
      eventType: m.event_type_type || 'Circuito Profesional',
      round: m.tournament_round || '',
      isFinal,
      argName: expandPlayerName(rawArgName),
      fullArgName: expandPlayerName(rawArgName),
      opponent: expandPlayerName(rawOpponent),
      argWon,
      scoreStr,
      setsCount: scoresList.length,
      hadTiebreak: scoreStr.includes('7-6') || scoreStr.includes('6-7'),
      isDoubles,
      status: m.event_status
    };
    item.prestige = getMatchPrestige(item);
    argMatches.push(item);
  }

  // Ordenar por jerarquía para que los partidos ATP/WTA/Challenger encabecen siempre la crónica
  return argMatches.sort((a, b) => b.prestige - a.prestige);
}

// Generación editorial con Gemini cuando la clave está disponible
async function generateEditorialWithGemini(dateStr, humanDate, argMatches) {
  const matchSummaryText = argMatches.map(m => {
    return `- ${m.argWon ? 'VICTORIA' : 'DERROTA'}: ${m.argName} vs ${m.opponent} en ${m.tournament} (${m.eventType}${m.isFinal ? ' - FINAL' : ''}) | Score: ${m.scoreStr}`;
  }).join('\n');

  const prompt = `
Actúa como un periodista deportivo argentino especializado en tenis para el portal "DobleFalta".
Fecha de la jornada: ${humanDate} (${dateStr}).

Resultados oficiales de los tenistas argentinos en la jornada (ordenados por importancia del torneo):
${matchSummaryText}

Escribe una crónica periodística extensa, original y profunda en español rioplatense neutro.
Responde únicamente con este objeto JSON válido:
{
  "title": "Título periodístico único nombrando a los ganadores principales de mayor jerarquía y el torneo (máximo 85 caracteres)",
  "slug": "resumen-argentinos-${dateStr}",
  "excerpt": "Resumen de 2 oraciones precisas destacando las figuras principales, los torneos y el balance numérico de la fecha.",
  "category": "Tenis Argentino",
  "readTime": "5 min",
  "content": "<p>Crónica completa en HTML con subtítulos <h2> y <h3>...</p>"
}
Requisitos:
1. Mínimo 550 palabras en "content".
2. Destaca en el título y primer párrafo a los tenistas de mayor jerarquía (ATP, WTA y Challenger antes que ITF).
3. Usa etiquetas HTML limpias (<p>, <h2>, <h3>, <strong>, <em>, <ul>, <li>).
`;

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3500,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error (${model}): ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && parsed.title && parsed.content) {
        return parsed;
      }
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Intento con ${model} falló: ${err.message}`);
    }
  }

  throw lastError || new Error('No se pudo generar con Gemini');
}

function generateRichJournalisticChronicle(dateStr, humanDate, argMatches) {
  const h = hashDate(dateStr);
  const victorias = argMatches.filter(m => m.argWon);
  const derrotas = argMatches.filter(m => !m.argWon);
  const singlesWins = victorias.filter(m => !m.isDoubles);
  const doublesWins = victorias.filter(m => m.isDoubles);
  const threeSetWins = victorias.filter(m => m.setsCount >= 3);
  const straightSetWins = victorias.filter(m => m.setsCount === 2);

  const byTournament = {};
  for (const m of argMatches) {
    if (!byTournament[m.tournament]) byTournament[m.tournament] = [];
    byTournament[m.tournament].push(m);
  }
  const tournamentNames = Object.keys(byTournament);
  const topTournaments = tournamentNames.slice(0, 3).join(', ');

  // Construir título priorizando campeones o las victorias de mayor jerarquía (ATP/WTA/Challenger)
  const championMatch = victorias.find(m => m.isFinal);
  let title = '';
  if (championMatch) {
    const cleanVenue = championMatch.tournament.replace(/\s*\(Qualy\)/i, '');
    title = `¡Campeón en ${cleanVenue}! ${championMatch.argName} se consagra y lidera la jornada argentina (${humanDate})`;
  } else if (singlesWins.length >= 2) {
    const p1 = singlesWins[0].argName;
    const p2 = singlesWins[1].argName;
    const mainVenue = singlesWins[0].tournament.replace(/\s*\(Qualy\)/i, '');
    const titleVariants = [
      `Triunfos de ${p1} en ${mainVenue} y ${p2}: Crónica argentina del ${humanDate}`,
      `${p1} y ${p2} pisan fuerte en ${mainVenue} y el circuito: Balance del ${humanDate}`,
      `Festejos de ${p1} y ${p2} en una jornada de ${victorias.length} victorias para la Legión (${humanDate})`
    ];
    title = titleVariants[h % titleVariants.length];
  } else if (victorias.length >= 1) {
    const hero = victorias[0].argName;
    const venue = victorias[0].tournament.replace(/\s*\(Qualy\)/i, '');
    title = `Gran victoria de ${hero} en ${venue} y balance argentino del ${humanDate}`;
  } else {
    title = `Crónica y análisis de los tenistas argentinos en ${topTournaments} (${humanDate})`;
  }

  const excerpt = victorias.length > 0
    ? `Cobertura completa del ${humanDate}: la Legión Argentina cosechó ${victorias.length} ${victorias.length === 1 ? 'triunfo' : 'triunfos'} en ${topTournaments}, con actuaciones destacadas de ${victorias.slice(0, 3).map(v => v.argName).join(', ')}.`
    : `Repaso periodístico de la actividad argentina del ${humanDate} en ${topTournaments}, con el análisis de los ${argMatches.length} encuentros disputados.`;

  const winRate = Math.round((victorias.length / argMatches.length) * 100);
  const introTemplates = [
    `<p>La actividad del <strong>${humanDate}</strong> dejó una huella sumamente intensa para los representantes del tenis argentino desplegados a lo largo del calendario internacional. Con presencia simultánea en escenarios como <strong>${topTournaments}</strong>, la delegación albiceleste completó un total de <strong>${argMatches.length} presentaciones oficiales</strong>, registrando un saldo de <strong>${victorias.length} ${victorias.length === 1 ? 'victoria' : 'victorias'} y ${derrotas.length} ${derrotas.length === 1 ? 'caída' : 'caídas'}</strong> (${winRate}% de eficacia en la jornada).</p>`,
    `<p>En una jornada de competencia distribuida entre diferentes superficies y husos horarios, el <strong>${humanDate}</strong> ofreció un panorama vibrante para la Legión Argentina. A través de los cuadros disputados en <strong>${topTournaments}</strong>, nuestros tenistas protagonizaron <strong>${argMatches.length} compromisos profesionales</strong>, logrando avanzar en <strong>${victorias.length} oportunidades</strong> y demostrando una vez más la vigencia competitiva del tenis nacional tanto en la rama individual como en la modalidad de dobles.</p>`,
    `<p>El circuito profesional de tenis tuvo durante el <strong>${humanDate}</strong> un marcado protagonismo argentino en los cuadros de <strong>${topTournaments}</strong>. Al cabo de una extensa agenda que abarcó <strong>${argMatches.length} partidos finalizados</strong>, el balance arrojó <strong>${victorias.length} festejos albicelestes</strong> frente a ${derrotas.length} derrotas, consolidando puntos valiosos de cara a la próxima actualización del escalafón mundial.</p>`,
    `<p>Desde las canchas rápidas del circuito internacional hasta el exigente polvo de ladrillo sudamericano, el <strong>${humanDate}</strong> puso a prueba la jerarquía de los tenistas argentinos en certámenes como <strong>${topTournaments}</strong>. Con <strong>${victorias.length} triunfos sobre ${argMatches.length} presentaciones</strong>, la jornada combinó victorias en sets corridos con verdaderas batallas tácticas definidas en sets decisivos.</p>`
  ];

  let html = introTemplates[h % introTemplates.length];

  if (singlesWins.length > 0) {
    html += `<h2>Las figuras del día: Análisis de los triunfos individuales</h2>`;
    const featuredSingles = singlesWins.slice(0, 4);
    const singleParagraphs = featuredSingles.map((m) => {
      if (m.setsCount >= 3) {
        return `<p>Uno de los duelos más exigentes y emotivos de la fecha tuvo como protagonista a <strong>${m.argName}</strong> en el marco del torneo de <strong>${m.tournament}</strong>. En un encuentro de altísima paridad táctica frente a <strong>${m.opponent}</strong>, el representante argentino supo gestionar los momentos de máxima tensión para terminar imponiéndose por <strong>${m.scoreStr}</strong>. La capacidad para sostener la intensidad física en el parcial decisivo y ajustar la devolución en los games críticos resultaron determinantes para inclinar la balanza.</p>`;
      } else if (m.hadTiebreak) {
        return `<p>En <strong>${m.tournament}</strong>, <strong>${m.argName}</strong> exhibió una notable templanza mental para superar a <strong>${m.opponent}</strong> con un marcador final de <strong>${m.scoreStr}</strong>. La clave del cruce pasó por la precisión ejecutada durante el desempate (<em>tie-break</em>), instancia donde el tenista nacional elevó su porcentaje de primeros servicios y minimizó los errores no forzados desde la línea de base para destrabar el partido sin necesidad de alargar el desgaste.</p>`;
      } else {
        return `<p>Por su parte, <strong>${m.argName}</strong> firmó una actuación sumamente sólida y sin fisuras en <strong>${m.tournament}</strong> al derrotar en sets corridos a <strong>${m.opponent}</strong> por <strong>${m.scoreStr}</strong>. Dominando el centro de la cancha desde los primeros compases y aprovechando con autoridad las oportunidades de quiebre generadas, logró cerrar el compromiso con solvencia para avanzar a la siguiente instancia del certamen con un desgaste físico controlado.</p>`;
      }
    });
    html += singleParagraphs.join('\n');

    if (singlesWins.length > 4) {
      const restSingles = singlesWins.slice(4).map(m => `<strong>${m.argName}</strong> (vencedor ante ${m.opponent} por ${m.scoreStr} en ${m.tournament})`).join(', ');
      html += `<p>La cosecha en los cuadros individuales se completó con las valiosas victorias obtenidas por ${restSingles}, ratificando la amplitud de nombres que empujan semana a semana desde cada escalón del circuito.</p>`;
    }
  }

  if (doublesWins.length > 0) {
    html += `<h2>Protagonismo argentino en la red: La jornada de dobles</h2>`;
    const doublesDescriptions = doublesWins.map(m => {
      return `la dupla integrada por <strong>${m.argName}</strong> derrotó a la pareja <strong>${m.opponent}</strong> por <strong>${m.scoreStr}</strong> en <em>${m.tournament}</em>`;
    });
    html += `<p>La especialidad de dobles volvió a aportar alegrías significativas para la delegación nacional gracias a la coordinación en la red y la firmeza en los turnos de saque. En esta jornada se destacó que ${doublesDescriptions.join('; mientras que ')}. En un formato donde los puntos decisivos sin ventaja (<em>no-ad</em>) y los <em>super tie-breaks</em> a diez puntos exigen reflejos inmediatos, los especialistas argentinos volvieron a marcar diferencias.</p>`;
  }

  html += `<h2>Panorama torneo por torneo: Así se repartió la acción</h2>`;
  html += `<p>La dispersión geográfica del calendario obligó a los jugadores argentinos a adaptarse a condiciones de juego muy diversas a lo largo de las <strong>${tournamentNames.length} sedes</strong> donde hubo presencia nacional durante este ${humanDate}:</p>`;

  for (const [tName, tMatches] of Object.entries(byTournament)) {
    const tWins = tMatches.filter(m => m.argWon);
    const tLosses = tMatches.filter(m => !m.argWon);
    html += `<h3>📍 ${tName} (${tMatches.length} ${tMatches.length === 1 ? 'partido' : 'partidos'})</h3>`;

    const details = tMatches.map(m => {
      if (m.argWon) {
        return `el festejo de <strong>${m.argName}</strong> sobre ${m.opponent} (${m.scoreStr})`;
      } else {
        return `la caída de <strong>${m.argName}</strong> frente a ${m.opponent} (${m.scoreStr})`;
      }
    }).join(', ');

    html += `<p>En las canchas de <strong>${tName}</strong> se registraron ${tWins.length} ${tWins.length === 1 ? 'victoria' : 'victorias'} y ${tLosses.length} ${tLosses.length === 1 ? 'derrota' : 'derrotas'} para nuestros representantes, incluyendo ${details}.</p>`;
  }

  html += `<h2>Resumen oficial de resultados del ${humanDate}</h2>`;
  if (victorias.length > 0) {
    html += `<p><strong>Victorias registradas (${victorias.length}):</strong></p><ul>`;
    victorias.forEach(m => {
      html += `<li><strong>${m.argName}</strong> venció a ${m.opponent} por <strong>${m.scoreStr}</strong> — <em>${m.tournament}</em></li>`;
    });
    html += `</ul>`;
  }
  if (derrotas.length > 0) {
    html += `<p><strong>Encuentros con derrota (${derrotas.length}):</strong></p><ul>`;
    derrotas.forEach(m => {
      html += `<li><strong>${m.argName}</strong> cedió ante ${m.opponent} por ${m.scoreStr} — <em>${m.tournament}</em></li>`;
    });
    html += `</ul>`;
  }

  const closingTemplates = [
    `<h2>Lectura táctica y proyección en el Ranking</h2><p>Con ${straightSetWins.length} triunfos resueltos en sets corridos y ${threeSetWins.length} victorias trabajadas en el máximo de parciales, el balance del ${humanDate} confirma la competitividad de los tenistas argentinos en las distintas categorías del circuito. Cada ronda superada no solo representa un impulso anímico para lo que resta de la semana, sino una cosecha clave de unidades dentro del sistema rodante de 52 semanas de la ATP y la WTA.</p>`,
    `<h2>Lo que dejó la fecha para el tenis nacional</h2><p>El saldo de ${victorias.length} victorias sobre ${argMatches.length} encuentros disputados en ${tournamentNames.length} torneos diferentes refleja el enorme volumen de jugadores argentinos activos cada semana en el plano internacional. Mientras quienes avanzaron de ronda ya preparan sus compromisos de la próxima jornada, la temporada continúa ofreciendo oportunidades constantes de ascenso en el escalafón mundial.</p>`,
    `<h2>Claves del rendimiento y continuidad de la gira</h2><p>Analizando el desglose estadístico del ${humanDate}, la efectividad en los sets iniciales y la resistencia en los momentos de definición (${threeSetWins.length} triunfos en tres parciales) fueron los pilares de los ${victorias.length} festejos conseguidos. En <strong>DobleFalta</strong> continuaremos acompañando cada presentación de la Legión con marcadores en directo y el impacto actualizado en la tabla anual.</p>`
  ];
  html += closingTemplates[h % closingTemplates.length];

  return {
    title,
    slug: `resumen-argentinos-${dateStr}`,
    excerpt,
    category: 'Tenis Argentino',
    readTime: '5 min',
    content: html
  };
}

const usedImagesInRun = new Set();

async function processDate(targetDate) {
  const humanDate = formatHumanDate(targetDate);
  console.log(`\n📅 Analizando jornada: ${targetDate} (${humanDate})`);

  const rawMatches = await fetchFixtures(targetDate);
  console.log(`📦 Partidos totales en el calendario: ${rawMatches.length}`);

  const argMatches = parseArgMatches(rawMatches);
  console.log(`🇦🇷 Partidos completados con tenistas argentinos: ${argMatches.length}`);

  if (argMatches.length === 0) {
    console.log(`ℹ️ No hubo partidos finalizados de tenistas argentinos en la fecha ${targetDate}. Se omite.`);
    return false;
  }

  let article;
  if (GEMINI_API_KEY) {
    try {
      console.log('🤖 Redactando crónica periodística profunda con Gemini AI...');
      article = await generateEditorialWithGemini(targetDate, humanDate, argMatches);
    } catch (geminiErr) {
      console.warn('⚠️ Respaldo activado tras error de Gemini:', geminiErr.message);
      article = generateRichJournalisticChronicle(targetDate, humanDate, argMatches);
    }
  } else {
    console.log('📝 Redactando crónica periodística extensa y analítica por torneo...');
    article = generateRichJournalisticChronicle(targetDate, humanDate, argMatches);
  }

  // Buscar foto real de prensa del jugador argentino protagonista de esa jornada y torneo
  const contextualPhotoUrl = await findContextualMatchPhoto(argMatches, targetDate, usedImagesInRun);

  const docId = article.slug || `resumen-argentinos-${targetDate}`;
  const finalDoc = {
    ...article,
    publishedAt: targetDate,
    author: 'Redacción DobleFalta',
    imageUrl: contextualPhotoUrl,
    totalMatches: argMatches.length,
    createdAt: new Date().toISOString()
  };

  console.log(`💾 Guardando en Firestore colección 'news' con ID: ${docId}`);
  await setDoc(doc(db, 'news', docId), finalDoc);
  ensureUrlInSitemap(docId, targetDate);
  console.log(`✅ Guardado: "${finalDoc.title}" | Foto: ${contextualPhotoUrl}`);
  return true;
}

async function main() {
  console.log('🎾 Iniciando Generador de Crónicas Periodísticas: Tenistas Argentinos...');

  const backfillArg = process.argv.find(arg => arg.startsWith('--backfill='))?.split('=')[1] || process.env.BACKFILL_DAYS;
  const cliDate = process.argv.find(arg => arg.startsWith('--date='))?.split('=')[1];

  try {
    // Cargar imágenes ya utilizadas en Firestore para no repetir la misma foto si un tenista gana varios días seguidos
    try {
      const existingSnap = await getDocs(collection(db, 'news'));
      existingSnap.docs.forEach(d => {
        const img = d.data()?.imageUrl;
        if (img) usedImagesInRun.add(img);
      });
    } catch (e) {
      console.warn('⚠️ No se pudieron precargar imágenes previas:', e.message);
    }

    if (backfillArg) {
      const days = parseInt(backfillArg, 10) || 15;
      console.log(`🔄 Ejecutando actualización retroactiva de los últimos ${days} días...`);
      for (let i = days; i >= 1; i--) {
        const dStr = getArgentinaDate(-i);
        await processDate(dStr);
      }
      console.log('\n🎉 ¡Backfill de crónicas argentinas con fotos contextuales completado con éxito!');
    } else {
      const targetDate = cliDate || process.env.TARGET_DATE || getArgentinaDate(-1);
      await processDate(targetDate);
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el generador de noticias argentinas:', error);
    process.exit(1);
  }
}

main();
