import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const TENNIS_API_KEY = process.env.TENNIS_API_KEY || '7ae1bf3cbb989fe80c18917c0ba4ff9096c64a17eb4031cfec43dfee1be3d4f3';
const TENNIS_API_URL = 'https://api.api-tennis.com/tennis/';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Lista exhaustiva de apellidos / nombres de tenistas argentinos (ATP, WTA, Challenger e ITF)
const KNOWN_ARG_PLAYERS = [
  'cerundolo', 'baez', 'etcheverry', 'navone', 'comesana', 'ugo carabelli',
  'diaz acosta', 'tirante', 'coria', 'schwartzman', 'ficovich', 'kicker',
  'villanueva', 'olivo', 'casanova', 'midon', 'ambrogi', 'rodriguez taverna',
  'burruchaga', 'podoroska', 'carle', 'riera', 'sierra', 'capurro', 'ortenzi',
  'zeballos', 'gonzalez', 'molteni', 'bagnis', 'monterrubini', 'monzon',
  'descotte', 'farjat', 'estabee', 'valerio', 'lingua', 'aboian', 'perez contri',
  'galdos', 'paz'
];

function isArgPlayer(name) {
  if (!name) return false;
  const lower = name.toLowerCase();
  return KNOWN_ARG_PLAYERS.some(k => lower.includes(k));
}

// Obtener fecha en formato YYYY-MM-DD en hora de Argentina (ART)
function getArgentinaDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const options = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(d); // yyyy-mm-dd
}

// Formatear fecha para lectura humana (ej: "jueves 29 de octubre")
function formatHumanDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(`${dateStr}T12:00:00`);
  return dateObj.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

// Consultar API de tenis
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

// Parsear y estructurar partidos de argentinos terminados
function parseArgMatches(matches) {
  const argMatches = [];

  for (const m of matches) {
    const isP1Arg = isArgPlayer(m.event_first_player);
    const isP2Arg = isArgPlayer(m.event_second_player);

    if (!isP1Arg && !isP2Arg) continue;

    // Solo considerar partidos que hayan finalizado
    const isFinished = m.event_status === 'Finished' || m.event_status === 'Retired' || m.event_status === 'After Pen.';
    if (!isFinished) continue;

    const argName = isP1Arg ? m.event_first_player : m.event_second_player;
    const opponent = isP1Arg ? m.event_second_player : m.event_first_player;
    const argWon = isP1Arg ? m.event_winner === 'First Player' : m.event_winner === 'Second Player';

    const scoresList = (m.scores || []).map(s => {
      return isP1Arg
        ? `${s.score_first}-${s.score_second}`
        : `${s.score_second}-${s.score_first}`;
    });
    const scoreStr = scoresList.length > 0 ? scoresList.join(', ') : (m.event_final_result || 'Final');

    argMatches.push({
      tournament: m.tournament_name || 'Torneo Internacional',
      round: m.tournament_round || '',
      argName,
      opponent,
      argWon,
      scoreStr,
      status: m.event_status
    });
  }

  return argMatches;
}

// Generación editorial con Gemini cuando la clave está disponible
async function generateEditorialWithGemini(dateStr, humanDate, argMatches) {
  const victorias = argMatches.filter(m => m.argWon);
  const derrotas = argMatches.filter(m => !m.argWon);

  const matchSummaryText = argMatches.map(m => {
    return `- ${m.argWon ? 'VICTORIA' : 'DERROTA'}: ${m.argName} vs ${m.opponent} en ${m.tournament} (Score: ${m.scoreStr}${m.status === 'Retired' ? ' - Abandono' : ''})`;
  }).join('\n');

  const prompt = `
Actúa como un periodista deportivo argentino de tenis para el portal de noticias "DobleFalta".
Fecha de la jornada: ${humanDate} (${dateStr}).

Aquí tienes los resultados oficiales y confirmados de todos los tenistas argentinos que jugaron en la jornada:
${matchSummaryText}

Escribe una crónica periodística completa, atractiva, rigurosa y en español rioplatense neutro.
Debe tener exactamente este formato JSON (sin texto adicional ni bloques markdown \`\`\`json):
{
  "title": "Título periodístico y atrapante destacando las victorias o figuras principales (máximo 80 caracteres)",
  "slug": "resumen-argentinos-${dateStr}",
  "excerpt": "Un resumen de 2 oraciones para la portada destacando lo más importante de la jornada de los argentinos.",
  "category": "Tenis Argentino",
  "readTime": "4 min",
  "content": "<p>Párrafo de apertura con balance general de la jornada para la legión argentina...</p><h2>Las victorias destacadas</h2><p>Párrafo comentando los triunfos con detalles y marcadores...</p><h2>Otros resultados y balance</h2><p>Párrafo comentando los encuentros restantes y lo que se viene...</p>"
}

Requisitos:
1. Mínimo 400 palabras en "content".
2. Menciona a los jugadores reales y sus rivales y marcadores.
3. El campo "content" debe ser HTML limpio con <p>, <h2>, <strong> y <ul> si aplica.
4. Responde ÚNICAMENTE con el objeto JSON.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2500 }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

// Generador periodístico estructurado si no hay clave de Gemini
function generateStructuredReport(dateStr, humanDate, argMatches) {
  const victorias = argMatches.filter(m => m.argWon);
  const derrotas = argMatches.filter(m => !m.argWon);

  const mainWinners = victorias.slice(0, 3).map(m => m.argName).join(', ');
  const title = `Resultados de los tenistas argentinos: Jornada del ${humanDate}`;

  let contentHtml = `
    <p>La legión argentina completó una intensa jornada de actividad en el circuito profesional internacional con presencia en certámenes ATP, WTA y torneos Challenger. A continuación, el repaso detallado de todos los resultados con sus respectivos marcadores y actuaciones.</p>
  `;

  if (victorias.length > 0) {
    contentHtml += `<h2>Victorias argentinas de la fecha (${victorias.length})</h2><ul>`;
    victorias.forEach(m => {
      contentHtml += `<li><strong>${m.argName}</strong> superó a ${m.opponent} por <strong>${m.scoreStr}</strong> en <em>${m.tournament}</em>.</li>`;
    });
    contentHtml += `</ul>`;
  }

  if (derrotas.length > 0) {
    contentHtml += `<h2>Otros resultados de la jornada (${derrotas.length})</h2><ul>`;
    derrotas.forEach(m => {
      contentHtml += `<li>${m.argName} cayó ante ${m.opponent} por ${m.scoreStr} en <em>${m.tournament}</em>.</li>`;
    });
    contentHtml += `</ul>`;
  }

  contentHtml += `
    <h2>Seguimiento en DobleFalta</h2>
    <p>Todos los puntos sumados por los tenistas de nuestro país impactarán en la próxima actualización del ranking oficial ATP y WTA del día lunes. Seguí las transmisiones punto a punto, fixtures y estadísticas en vivo en nuestra plataforma.</p>
  `;

  return {
    title: title,
    slug: `resumen-argentinos-${dateStr}`,
    excerpt: `Balance completo de la legión argentina: ${victorias.length} victorias y ${derrotas.length} derrotas en certámenes ATP, WTA y Challenger.`,
    category: 'Tenis Argentino',
    readTime: '4 min',
    content: contentHtml
  };
}

async function main() {
  console.log('🎾 Iniciando Generador de Noticias: Resumen de Tenistas Argentinos...');

  // Determinar fecha: por defecto toma ayer (offset = -1) para garantizar partidos 100% finalizados
  const cliDate = process.argv.find(arg => arg.startsWith('--date='))?.split('=')[1];
  const targetDate = cliDate || process.env.TARGET_DATE || getArgentinaDate(-1);
  const humanDate = formatHumanDate(targetDate);

  console.log(`📅 Analizando jornada: ${targetDate} (${humanDate})`);

  try {
    const rawMatches = await fetchFixtures(targetDate);
    console.log(`📦 Partidos totales en el calendario: ${rawMatches.length}`);

    const argMatches = parseArgMatches(rawMatches);
    console.log(`🇦🇷 Partidos completados con tenistas argentinos: ${argMatches.length}`);

    if (argMatches.length === 0) {
      console.log(`ℹ️ No hubo partidos finalizados de tenistas argentinos en la fecha ${targetDate}. Se omite la publicación para evitar notas vacías.`);
      return;
    }

    let article;
    if (GEMINI_API_KEY) {
      console.log('🤖 Redactando crónica periodística profunda con Gemini AI...');
      article = await generateEditorialWithGemini(targetDate, humanDate, argMatches);
    } else {
      console.log('📝 Generando reporte estructurado de resultados argentinos...');
      article = generateStructuredReport(targetDate, humanDate, argMatches);
    }

    const docId = article.slug || `resumen-argentinos-${targetDate}`;
    const finalDoc = {
      ...article,
      publishedAt: targetDate,
      author: 'Redacción DobleFalta',
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
      totalMatches: argMatches.length,
      createdAt: new Date().toISOString()
    };

    console.log(`💾 Guardando en Firestore colección 'news' con ID: ${docId}`);
    await setDoc(doc(db, 'news', docId), finalDoc);

    console.log('✅ ¡Noticia de tenistas argentinos guardada con éxito!');
    console.log(`📌 Título: "${finalDoc.title}"`);
    console.log(`🔗 URL: /noticias/${docId}`);

  } catch (error) {
    console.error('❌ Error en el generador de noticias argentinas:', error);
    process.exit(1);
  }
}

main();
