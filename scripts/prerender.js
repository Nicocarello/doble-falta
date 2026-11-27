import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { SEED_NEWS } from '../src/data/editorialArticles.js';
import { MASTER_TOURNAMENTS } from '../src/constants/tennis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SITE_URL = 'https://doblefaltatenis.com.ar';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyB91DcrQp1yz3pWsppvk0MiVkrngCopSy0',
  authDomain: 'doble-falta.firebaseapp.com',
  projectId: 'doble-falta',
  storageBucket: 'doble-falta.firebasestorage.app',
  messagingSenderId: '470042716099',
  appId: '1:470042716099:web:edfccd9d3fe365c1573f76'
};

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function fetchAllArticles() {
  let firestoreArticles = [];
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'news'));
    firestoreArticles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`📡 Firestore: ${firestoreArticles.length} crónicas obtenidas.`);
  } catch (err) {
    console.warn(`⚠️ Sin conexión a Firestore durante el prerender (${err.message}). Usando SEED_NEWS y slugs del sitemap.`);
  }

  const seen = new Set(firestoreArticles.map(a => a.slug || a.id));
  const merged = [
    ...firestoreArticles,
    ...SEED_NEWS.filter(s => !seen.has(s.slug) && !seen.has(s.id))
  ].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

  return merged;
}

function safeSerializeJson(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function injectPageIntoTemplate(baseHtml, { title, description, canonicalPath, ogImage, ogType = 'website', jsonLd = null, prerenderData = null, rootInnerHtml }) {
  let html = baseHtml;

  const fullTitle = escapeHtml(title);
  const fullDesc = escapeHtml(description);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const imageUrl = escapeHtml(ogImage || `${SITE_URL}/logo.png`);

  // Reemplazar <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${fullTitle}</title>`);

  // Reemplazar <meta name="description">
  html = html.replace(
    /<meta\s+name="description"[\s\S]*?\/>/i,
    `<meta name="description" content="${fullDesc}" />`
  );

  // Reemplazar Open Graph tags
  html = html.replace(/<meta\s+property="og:title"[\s\S]*?\/>/i, `<meta property="og:title" content="${fullTitle}" />`);
  html = html.replace(/<meta\s+property="og:description"[\s\S]*?\/>/i, `<meta property="og:description" content="${fullDesc}" />`);
  html = html.replace(/<meta\s+property="og:image"[\s\S]*?\/>/i, `<meta property="og:image" content="${imageUrl}" />`);
  html = html.replace(/<meta\s+property="og:type"[\s\S]*?\/>/i, `<meta property="og:type" content="${ogType}" />`);

  // Agregar canonical, JSON-LD y datos de hidratación antes de </head>
  let headExtras = `  <link rel="canonical" href="${canonicalUrl}" />\n  <meta property="og:url" content="${canonicalUrl}" />\n`;
  if (jsonLd) {
    headExtras += `  <script type="application/ld+json">${safeSerializeJson(jsonLd)}</script>\n`;
  }
  if (prerenderData) {
    headExtras += `  <script>window.__PRERENDERED_ARTICLE__=${safeSerializeJson(prerenderData)};</script>\n`;
  }
  html = html.replace('</head>', `${headExtras}</head>`);

  // Reemplazar todo el contenido interno de <div id="root">...</div> (Vite mueve <script type="module"> al <head>, por lo que después de #root viene </body>)
  if (/<div id="root">[\s\S]*?<\/div>\s*<\/body>/i.test(html)) {
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>\s*<\/body>/i,
      `<div id="root">\n${rootInnerHtml}\n  </div>\n</body>`
    );
  } else {
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>\s*<script type="module"/i,
      `<div id="root">\n${rootInnerHtml}\n  </div>\n  <script type="module"`
    );
  }

  return html;
}

function buildArticleStaticHtml(article, relatedArticles) {
  const relatedLinks = relatedArticles.map(r => `
    <li>
      <a href="/noticias/${r.slug || r.id}" style="color: #c8ff00; text-decoration: underline;">
        ${escapeHtml(r.title)}
      </a> — <span>${escapeHtml(r.excerpt)}</span>
    </li>
  `).join('\n');

  return `
    <div style="padding: 24px; max-width: 860px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; color: #f0f0f0; background-color: #121417; line-height: 1.8;">
      <nav style="margin-bottom: 20px; display: flex; gap: 14px; flex-wrap: wrap;">
        <a href="/" style="color: #c8ff00;">Inicio</a>
        <a href="/noticias" style="color: #c8ff00;">← Todas las Noticias y Crónicas</a>
        <a href="/ranking" style="color: #c8ff00;">Ranking ATP/WTA</a>
        <a href="/juegos" style="color: #c8ff00;">Juegos de Tenis</a>
      </nav>
      <article>
        <header style="margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
          <span style="background: #c44d29; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 700;">
            ${escapeHtml(article.category || 'Tenis Argentino')}
          </span>
          <h1 style="font-size: 2rem; color: #ffffff; margin: 14px 0 10px 0; line-height: 1.3;">
            ${escapeHtml(article.title)}
          </h1>
          <p style="font-size: 1.1rem; color: #cccccc; font-style: italic; margin: 0 0 12px 0;">
            ${escapeHtml(article.excerpt)}
          </p>
          <div style="font-size: 0.85rem; color: #999999;">
            Por <strong>${escapeHtml(article.author || 'Redacción DobleFalta')}</strong> • Publicado el ${escapeHtml(article.publishedAt)} • Lectura: ${escapeHtml(article.readTime || '5 min')}
          </div>
        </header>
        ${article.imageUrl ? `<img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.title)}" style="width: 100%; max-height: 420px; object-fit: cover; border-radius: 10px; margin-bottom: 24px;" />` : ''}
        <div class="article-body">
          ${article.content}
        </div>
      </article>
      <section style="margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">
        <h2 style="color: #c8ff00; font-size: 1.3rem;">Artículos y Crónicas Relacionadas</h2>
        <ul>
          ${relatedLinks}
        </ul>
      </section>
    </div>
  `;
}

function buildNewsIndexStaticHtml(articles) {
  const listItems = articles.map(a => `
    <article style="margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,0.08);">
      <span style="font-size: 0.8rem; color: #c8ff00; font-weight: 700;">${escapeHtml(a.category || 'Tenis Argentino')} • ${escapeHtml(a.publishedAt)}</span>
      <h2 style="margin: 6px 0 8px 0; font-size: 1.35rem;">
        <a href="/noticias/${a.slug || a.id}" style="color: #ffffff; text-decoration: underline;">
          ${escapeHtml(a.title)}
        </a>
      </h2>
      <p style="margin: 0 0 8px 0; color: #cccccc;">${escapeHtml(a.excerpt)}</p>
      <a href="/noticias/${a.slug || a.id}" style="color: #c8ff00; font-size: 0.9rem; font-weight: 700;">Leer crónica completa →</a>
    </article>
  `).join('\n');

  return `
    <div style="padding: 24px; max-width: 960px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; color: #f0f0f0; background-color: #121417; line-height: 1.7;">
      <header style="margin-bottom: 28px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 18px;">
        <h1 style="color: #c8ff00; font-size: 2rem; margin: 0 0 10px 0;">Noticias, Crónicas de Tenistas Argentinos y Análisis ATP/WTA</h1>
        <p style="color: #cccccc; margin: 0;">Cobertura periodística diaria del desempeño de la Legión Argentina en el circuito mundial, historia del tenis nacional, reglamento y análisis táctico.</p>
      </header>
      <main>
        ${listItems}
      </main>
    </div>
  `;
}

function buildTournamentsStaticHtml() {
  const categories = ['Slams', 'ATP 1000', 'ATP 500', 'ATP 250'];
  const sectionsHtml = categories.map(cat => {
    const list = MASTER_TOURNAMENTS[cat] || [];
    const items = list.map(t => `
      <li>
        <a href="/tournament/${encodeURIComponent(cat)}/${t.id}" style="color: #c8ff00; font-weight: 700;">
          ${escapeHtml(t.name)}
        </a> — ${escapeHtml(t.city)} (${escapeHtml(t.surface)}, ${escapeHtml(t.duration)})
      </li>
    `).join('\n');
    return `
      <section style="margin-bottom: 24px;">
        <h2 style="color: #c8ff00; font-size: 1.4rem;">${escapeHtml(cat === 'Slams' ? 'Grand Slams' : cat)}</h2>
        <ul>${items}</ul>
      </section>
    `;
  }).join('\n');

  return `
    <div style="padding: 24px; max-width: 960px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; color: #f0f0f0; background-color: #121417; line-height: 1.7;">
      <header style="margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
        <h1 style="color: #c8ff00; font-size: 2rem; margin: 0 0 10px 0;">Calendario y Directorio de Torneos ATP, Grand Slams y Challenger</h1>
        <p style="color: #cccccc; margin: 0;">Guía completa de todos los torneos oficiales del circuito profesional de tenis: sedes, superficies, fechas y campeones históricos.</p>
      </header>
      <main>
        ${sectionsHtml}
      </main>
    </div>
  `;
}

function buildSectionStaticHtml({ heading, subtitle, paragraphs = [], listItems = [], extraLinks = [] }) {
  const pHtml = paragraphs.map(p => `<p style="color: #cccccc; margin-bottom: 14px;">${p}</p>`).join('\n');
  const liHtml = listItems.length > 0
    ? `<ul style="margin-bottom: 20px; color: #cccccc;">${listItems.map(li => `<li style="margin-bottom: 8px;">${li}</li>`).join('\n')}</ul>`
    : '';
  const linksHtml = extraLinks.length > 0
    ? `<nav style="margin-top: 24px; display: flex; gap: 14px; flex-wrap: wrap;">${extraLinks.map(l => `<a href="${l.href}" style="color: #c8ff00; text-decoration: underline;">${escapeHtml(l.label)}</a>`).join('\n')}</nav>`
    : '';

  return `
    <div style="padding: 24px; max-width: 920px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; color: #f0f0f0; background-color: #121417; line-height: 1.75;">
      <nav style="margin-bottom: 20px; display: flex; gap: 14px; flex-wrap: wrap;">
        <a href="/" style="color: #c8ff00;">Inicio</a>
        <a href="/noticias" style="color: #c8ff00;">Noticias y Crónicas</a>
        <a href="/ranking" style="color: #c8ff00;">Ranking ATP/WTA</a>
        <a href="/ranking/en-vivo" style="color: #c8ff00;">Ranking en Vivo</a>
        <a href="/tournaments" style="color: #c8ff00;">Torneos</a>
        <a href="/juegos" style="color: #c8ff00;">Juegos</a>
      </nav>
      <header style="margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
        <h1 style="color: #c8ff00; font-size: 2rem; margin: 0 0 10px 0;">${escapeHtml(heading)}</h1>
        <p style="color: #cccccc; margin: 0; font-size: 1.05rem;">${escapeHtml(subtitle)}</p>
      </header>
      <main>
        ${pHtml}
        ${liHtml}
        ${linksHtml}
      </main>
    </div>
  `;
}

const STATIC_SECTION_PAGES = [
  {
    path: '/ranking',
    title: 'Ranking Mundial ATP y WTA Actualizado - DobleFalta',
    description: 'Consulta el Ranking Mundial ATP y WTA actualizado semana a semana, con filtro exclusivo de tenistas argentinos, puntos oficiales y movimientos.',
    heading: 'Ranking Mundial ATP y WTA Oficial',
    subtitle: 'Clasificación actualizada con los mejores jugadores y jugadoras del circuito profesional y seguimiento de los tenistas argentinos.',
    paragraphs: [
      'El ranking oficial de la ATP y la WTA opera bajo un sistema acumulativo rodante de 52 semanas. Cada lunes las posiciones se actualizan descontando los puntos defendidos de la edición anterior e incorporando los obtenidos en los últimos certámenes.',
      'La sumatoria de cada tenista se calcula tomando los mejores 19 resultados en los cuatro Grand Slams (2.000 puntos al campeón), los nueve Masters 1000 (1.000 puntos), los torneos ATP 500, ATP 250 y el circuito Challenger.'
    ],
    extraLinks: [
      { href: '/ranking/en-vivo', label: 'Ver Ranking ATP En Vivo (Proyección Semanal)' },
      { href: '/noticias/como-funciona-sistema-puntos-ranking-atp', label: 'Guía completa del sistema de puntos ATP' }
    ]
  },
  {
    path: '/ranking/en-vivo',
    title: 'Ranking ATP En Vivo (Live Ranking) - DobleFalta',
    description: 'Ranking ATP en vivo proyectado partido a partido. Seguí los puntos ganados, los puntos defendidos de la temporada anterior y el ascenso de los argentinos.',
    heading: 'Ranking ATP En Vivo y Proyección Semanal',
    subtitle: 'Cálculo proyectado en tiempo real según los resultados parciales de la semana en Grand Slams, Masters 1000, ATP 500/250 y Challengers.',
    paragraphs: [
      'A diferencia de la tabla oficial que se publica cada lunes, el Ranking ATP En Vivo refleja cómo quedaría el escalafón mundial si los torneos de la semana terminaran hoy.',
      'Nuestra proyección aplica la fórmula oficial: Puntos en Vivo = Puntos Oficiales − Puntos Defendidos de la misma semana del año anterior + Puntos Ganados por la ronda alcanzada en el torneo en curso.'
    ],
    listItems: [
      '<strong>Puntos Ganados:</strong> Se asignan automáticamente según la instancia alcanzada y la jerarquía del torneo.',
      '<strong>Puntos a Defender:</strong> Descuento de las unidades sumadas 52 semanas atrás.',
      '<strong>Filtro 🇦🇷 ARG:</strong> Seguimiento instantáneo de los tenistas argentinos en movimiento durante la gira.'
    ],
    extraLinks: [
      { href: '/ranking', label: 'Ver Ranking Oficial ATP y WTA' },
      { href: '/noticias/como-funciona-sistema-puntos-ranking-atp', label: 'Cómo funciona la defensa de puntos' }
    ]
  },
  {
    path: '/juegos',
    title: 'Juegos y Trivias Diarias de Tenis - DobleFalta',
    description: 'Desafíos interactivos diarios para fanáticos del tenis: Adivina el Tenista, Top 10 Histórico ATP desde 1990, Racha Head-to-Head y Tenisdle.',
    heading: 'Juegos y Desafíos Diarios de Tenis',
    subtitle: 'Poné a prueba tu conocimiento sobre la historia del tenis, el ranking ATP/WTA y las grandes rivalidades del circuito.',
    listItems: [
      '<a href="/juegos/adivina" style="color: #c8ff00;"><strong>Adivina el Tenista:</strong></a> Descubrí al jugador oculto del día con pistas de nacionalidad, mejor ranking y títulos.',
      '<a href="/juegos/top10" style="color: #c8ff00;"><strong>Top 10 Histórico:</strong></a> Completá los 10 mejores jugadores de una semana histórica del ranking ATP desde 1990.',
      '<a href="/juegos/racha-h2h" style="color: #c8ff00;"><strong>Racha Head-to-Head (H2H):</strong></a> Elegí quién domina el historial oficial entre dos figuras del circuito.',
      '<a href="/juegos/tenisdle" style="color: #c8ff00;"><strong>Tenisdle:</strong></a> Adiviná el apellido del tenista del día en hasta seis intentos.'
    ]
  },
  {
    path: '/juegos/adivina',
    title: 'Adivina el Tenista del Día - Juegos DobleFalta',
    description: 'Juego diario de tenis: descubrí al jugador o jugadora oculta a través de cinco pistas progresivas sobre su carrera y títulos.',
    heading: 'Adivina el Tenista del Día',
    subtitle: 'Nuevo desafío diario cada medianoche (hora de Argentina) con protagonistas históricos y actuales del circuito ATP y WTA.',
    paragraphs: ['En cada intento fallido se desbloquea una nueva pista: país de origen, mano hábil, mejor posición en el ranking mundial, cantidad de títulos de Grand Slam y participaciones destacadas.'],
    extraLinks: [{ href: '/juegos', label: '← Volver a todos los juegos' }]
  },
  {
    path: '/juegos/top10',
    title: 'Top 10 Histórico del Ranking ATP - Juegos DobleFalta',
    description: 'Desafío de memoria tenística: completá el Top 10 del ranking ATP de una semana histórica entre 1990 y la actualidad.',
    heading: 'Top 10 Histórico del Ranking ATP',
    subtitle: 'Viajá a una semana puntual del circuito masculino desde 1990 hasta hoy y acertá a los diez mejores jugadores del escalafón.',
    paragraphs: ['Recordá las épocas doradas de Sampras, Agassi, Federer, Nadal, Djokovic, Vilas, Coria, Gaudio, Nalbandian y Del Potro en este desafío contrarreloj o sin reloj.'],
    extraLinks: [{ href: '/juegos', label: '← Volver a todos los juegos' }]
  },
  {
    path: '/juegos/racha-h2h',
    title: 'Racha Head-to-Head (H2H) - Juegos DobleFalta',
    description: '¿Quién lidera el historial oficial frente a frente? Poné a prueba tu racha comparando enfrentamientos directos en ATP y WTA.',
    heading: 'Racha Head-to-Head (H2H)',
    subtitle: 'Compará dos jugadores del circuito profesional y adiviná quién domina el historial oficial de partidos disputados entre ambos.',
    paragraphs: ['Utilizando los registros oficiales de enfrentamientos directos de la ATP y la WTA, cada acierto extiende tu racha y presenta un nuevo retador.'],
    extraLinks: [{ href: '/h2h', label: 'Ir al comparador completo H2H' }]
  },
  {
    path: '/juegos/tenisdle',
    title: 'Tenisdle: Wordle Diario de Tenis - DobleFalta',
    description: 'Juego diario estilo Wordle en español para adivinar apellidos de tenistas profesionales en seis intentos.',
    heading: 'Tenisdle: El Desafío Diario de Palabras de Tenis',
    subtitle: 'Adiviná el apellido oculto de una figura del tenis mundial en un máximo de seis intentos con pistas por color de letra.',
    paragraphs: ['Verde indica letra correcta en posición exacta; amarillo indica que la letra pertenece al apellido en otra posición. Un nuevo jugador se habilita cada día.'],
    extraLinks: [{ href: '/juegos', label: '← Volver a todos los juegos' }]
  },
  {
    path: '/h2h',
    title: 'Historial Frente a Frente (Head to Head) ATP y WTA - DobleFalta',
    description: 'Comparador oficial Head to Head (H2H): revisá todos los enfrentamientos previos, victorias, derrotas y marcadores entre cualquier pareja de tenistas.',
    heading: 'Comparador Head-to-Head (H2H)',
    subtitle: 'Consultá el historial completo de enfrentamientos directos entre dos tenistas del circuito ATP o WTA.',
    paragraphs: ['Buscá cualquier par de jugadores para consultar su balance histórico oficial, desglose de partidos por torneo, superficie y marcadores set por set.']
  },
  {
    path: '/comunidad',
    title: 'Comunidad y Foro de Debate de Tenis - DobleFalta',
    description: 'Sumate a los debates de la comunidad de DobleFalta sobre el circuito ATP, WTA, tenistas argentinos, Grand Slams y Challengers.',
    heading: 'Comunidad y Foro de Debate de Tenis',
    subtitle: 'Espacio abierto para compartir opiniones, análisis tácticos y seguimiento de los torneos junto a otros aficionados.',
    paragraphs: ['Participá de los hilos de debate sobre el presente de la Legión Argentina, el circuito Challenger sudamericano y las definiciones de Grand Slam y Masters 1000.']
  },
  {
    path: '/about',
    title: 'Sobre Nosotros - DobleFalta',
    description: 'Conocé el equipo detrás de DobleFalta, portal independiente argentino dedicado a resultados en vivo, estadísticas y periodismo de tenis.',
    heading: 'Sobre DobleFalta',
    subtitle: 'Plataforma independiente dedicada al seguimiento del circuito profesional de tenis y la cobertura periodística de la Legión Argentina.',
    paragraphs: [
      'DobleFalta nació con el objetivo de ofrecer a los aficionados hispanohablantes una herramienta rápida, limpia y completa para seguir marcadores minuto a minuto, estadísticas ATP/WTA, proyecciones de ranking y crónicas diarias.',
      'Ponemos especial foco en la trayectoria de los jugadores y jugadoras de Argentina y Sudamérica en cada escalón del circuito mundial.'
    ]
  },
  {
    path: '/contact',
    title: 'Contacto - DobleFalta',
    description: 'Contactate con el equipo de DobleFalta para consultas editoriales, sugerencias técnicas o propuestas comerciales.',
    heading: 'Contacto — DobleFalta',
    subtitle: 'Canales de comunicación directa con la redacción y soporte técnico del portal.',
    paragraphs: ['Para sugerencias, reportes técnicos o consultas comerciales, escribinos a <!--email_off-->doblefaltat@gmail.com<!--/email_off-->. Tiempo estimado de respuesta: 24 a 48 horas hábiles.']
  },
  {
    path: '/privacy',
    title: 'Política de Privacidad - DobleFalta',
    description: 'Información transparente sobre privacidad, uso de cookies, Google Analytics y Google AdSense en DobleFalta.',
    heading: 'Política de Privacidad',
    subtitle: 'Cómo tratamos los datos técnicos de navegación, almacenamiento local y cookies en doblefaltatenis.com.ar.',
    paragraphs: ['DobleFalta respeta la privacidad de sus visitantes. No solicitamos registros obligatorios para consultar marcadores ni noticias y detallamos el uso de cookies analíticas y publicitarias de terceros conforme a la normativa vigente.']
  },
  {
    path: '/terms',
    title: 'Términos y Condiciones de Uso - DobleFalta',
    description: 'Condiciones generales de uso, propiedad intelectual y exención de responsabilidad informativa de DobleFalta.',
    heading: 'Términos y Condiciones',
    subtitle: 'Reglas de uso del sitio, participación en el foro comunitario y carácter informativo de las estadísticas.',
    paragraphs: ['El acceso a los resultados, rankings, crónicas editoriales y juegos interactivos de DobleFalta es gratuito y de carácter exclusivamente informativo y recreativo.']
  }
];

function generateSitemapXml(articles) {
  const staticUrls = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/noticias', changefreq: 'daily', priority: '0.9' },
    { loc: '/tournaments', changefreq: 'weekly', priority: '0.85' },
    { loc: '/ranking', changefreq: 'daily', priority: '0.9' },
    { loc: '/ranking/en-vivo', changefreq: 'daily', priority: '0.85' },
    { loc: '/h2h', changefreq: 'weekly', priority: '0.8' },
    { loc: '/comunidad', changefreq: 'daily', priority: '0.8' },
    { loc: '/juegos', changefreq: 'daily', priority: '0.8' },
    { loc: '/juegos/adivina', changefreq: 'daily', priority: '0.7' },
    { loc: '/juegos/top10', changefreq: 'daily', priority: '0.7' },
    { loc: '/juegos/racha-h2h', changefreq: 'daily', priority: '0.7' },
    { loc: '/juegos/tenisdle', changefreq: 'daily', priority: '0.7' },
    { loc: '/category/ATP%201000', changefreq: 'daily', priority: '0.7' },
    { loc: '/category/ATP%20500', changefreq: 'daily', priority: '0.7' },
    { loc: '/category/ATP%20250', changefreq: 'daily', priority: '0.7' },
    { loc: '/about', changefreq: 'monthly', priority: '0.6' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
    { loc: '/privacy', changefreq: 'monthly', priority: '0.4' },
    { loc: '/terms', changefreq: 'monthly', priority: '0.4' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const u of staticUrls) {
    xml += `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>\n`;
  }

  for (const a of articles) {
    const slug = a.slug || a.id;
    const isDaily = slug.startsWith('resumen-argentinos-');
    xml += `  <url>\n    <loc>${SITE_URL}/noticias/${slug}</loc>\n    <lastmod>${a.publishedAt || '2026-11-12'}</lastmod>\n    <changefreq>${isDaily ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${isDaily ? '0.8' : '0.85'}</priority>\n  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

async function runPrerender() {
  console.log('🚀 Iniciando prerenderizado estático de rutas y generación de sitemap.xml...');

  const baseHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('❌ No se encontró dist/index.html. Ejecutá vite build primero.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
  const articles = await fetchAllArticles();

  // 1. Generar dist/noticias/index.html
  const newsIndexDir = path.join(DIST_DIR, 'noticias');
  fs.mkdirSync(newsIndexDir, { recursive: true });
  const newsIndexHtml = injectPageIntoTemplate(baseHtml, {
    title: 'Noticias, Crónicas de Tenistas Argentinos y Análisis ATP/WTA - DobleFalta',
    description: 'Crónicas diarias de los tenistas argentinos en el circuito ATP, WTA y Challenger, historia de la Legión Argentina, análisis táctico y guías del ranking mundial en DobleFalta.',
    canonicalPath: '/noticias',
    rootInnerHtml: buildNewsIndexStaticHtml(articles)
  });
  fs.writeFileSync(path.join(newsIndexDir, 'index.html'), newsIndexHtml, 'utf-8');

  // 1b. Generar dist/tournaments/index.html (Evita Soft 404 en Google Search Console)
  const tournamentsDir = path.join(DIST_DIR, 'tournaments');
  fs.mkdirSync(tournamentsDir, { recursive: true });
  const tournamentsHtml = injectPageIntoTemplate(baseHtml, {
    title: 'Calendario y Directorio de Torneos ATP, Grand Slams y Challenger - DobleFalta',
    description: 'Directorio completo de torneos oficiales de tenis: los cuatro Grand Slams, los nueve Masters 1000, torneos ATP 500, ATP 250 y la gira Challenger en vivo.',
    canonicalPath: '/tournaments',
    rootInnerHtml: buildTournamentsStaticHtml()
  });
  fs.writeFileSync(path.join(tournamentsDir, 'index.html'), tournamentsHtml, 'utf-8');

  // 1c. Generar páginas estáticas con canonical único para todas las secciones principales
  for (const sec of STATIC_SECTION_PAGES) {
    const relPath = sec.path.replace(/^\/+/, '');
    const secDir = path.join(DIST_DIR, ...relPath.split('/'));
    fs.mkdirSync(secDir, { recursive: true });
    const secHtml = injectPageIntoTemplate(baseHtml, {
      title: sec.title,
      description: sec.description,
      canonicalPath: sec.path,
      rootInnerHtml: buildSectionStaticHtml(sec)
    });
    fs.writeFileSync(path.join(secDir, 'index.html'), secHtml, 'utf-8');
  }
  console.log(`✅ Prerenderizadas ${STATIC_SECTION_PAGES.length + 2} rutas de secciones principales con canonical propio.`);

  // 2. Generar dist/noticias/<slug>/index.html para cada artículo
  let count = 0;
  for (const article of articles) {
    const slug = article.slug || article.id;
    if (!slug) continue;

    const articleDir = path.join(DIST_DIR, 'noticias', slug);
    fs.mkdirSync(articleDir, { recursive: true });

    const related = articles.filter(a => (a.slug || a.id) !== slug).slice(0, 4);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.excerpt,
      "image": article.imageUrl ? [article.imageUrl] : [],
      "datePublished": article.publishedAt,
      "author": [{
        "@type": "Organization",
        "name": article.author || "Redacción DobleFalta",
        "url": `${SITE_URL}/about`
      }],
      "publisher": {
        "@type": "Organization",
        "name": "DobleFalta",
        "url": SITE_URL
      }
    };

    const articleHtml = injectPageIntoTemplate(baseHtml, {
      title: `${article.title} - DobleFalta`,
      description: article.excerpt,
      canonicalPath: `/noticias/${slug}`,
      ogImage: article.imageUrl,
      ogType: 'article',
      jsonLd,
      prerenderData: article,
      rootInnerHtml: buildArticleStaticHtml(article, related)
    });

    fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml, 'utf-8');
    count++;
  }
  console.log(`✅ Prerenderizados ${count} artículos estáticos en dist/noticias/<slug>/index.html`);

  // 3. Actualizar dist/index.html para incluir también las últimas noticias en el fallback estático de la portada
  const latestLinksHtml = articles.slice(0, 8).map(a => `
    <li style="margin-bottom: 8px;">
      <a href="/noticias/${a.slug || a.id}" style="color: #c8ff00; text-decoration: underline; font-weight: 600;">
        ${escapeHtml(a.title)}
      </a> (${escapeHtml(a.publishedAt)}) — ${escapeHtml(a.excerpt)}
    </li>
  `).join('\n');

  let updatedHomeHtml = baseHtml.replace(
    '</head>',
    `  <link rel="canonical" href="${SITE_URL}/" />\n  <meta property="og:url" content="${SITE_URL}/" />\n</head>`
  );
  updatedHomeHtml = updatedHomeHtml.replace(
    '</main>',
    `  <section style="margin-bottom: 28px;">
          <h2 style="color: #ffffff; font-size: 1.4rem; margin-bottom: 10px;">Últimas Crónicas del Tenis Argentino y Guías Editoriales</h2>
          <ul style="line-height: 1.7; color: #b8b8b8;">
            ${latestLinksHtml}
          </ul>
        </section>\n      </main>`
  );
  fs.writeFileSync(baseHtmlPath, updatedHomeHtml, 'utf-8');

  // 4. Generar y guardar sitemap.xml actualizado en public/ y dist/
  const sitemapXml = generateSitemapXml(articles);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`🗺️ Sitemap actualizado en public/sitemap.xml y dist/sitemap.xml con ${articles.length + 17} URLs.`);

  process.exit(0);
}

runPrerender();

