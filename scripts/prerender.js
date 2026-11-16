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

function injectPageIntoTemplate(baseHtml, { title, description, canonicalPath, ogImage, ogType = 'website', jsonLd = null, rootInnerHtml }) {
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

  // Agregar canonical y JSON-LD antes de </head>
  let headExtras = `  <link rel="canonical" href="${canonicalUrl}" />\n  <meta property="og:url" content="${canonicalUrl}" />\n`;
  if (jsonLd) {
    headExtras += `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n`;
  }
  html = html.replace('</head>', `${headExtras}</head>`);

  // Reemplazar el interior de <div id="root">...</div>
  html = html.replace(
    /<div id="root">[\s\S]*?<\/div>\s*<script type="module"/i,
    `<div id="root">\n${rootInnerHtml}\n  </div>\n  <script type="module"`
  );

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

function generateSitemapXml(articles) {
  const staticUrls = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/noticias', changefreq: 'daily', priority: '0.9' },
    { loc: '/tournaments', changefreq: 'weekly', priority: '0.85' },
    { loc: '/ranking', changefreq: 'daily', priority: '0.9' },
    { loc: '/ranking/en-vivo', changefreq: 'daily', priority: '0.85' },
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

  const updatedHomeHtml = baseHtml.replace(
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

