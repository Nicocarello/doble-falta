import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, query, limit } from 'firebase/firestore';

// Configuración de Firebase (mismo proyecto doble-falta)
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Imágenes representativas de tenis de alta resolución (Unsplash con licencia libre)
const TENNIS_IMAGES = [
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1530915534664-4ac642379740?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80'
];

// 1. Obtener los titulares más recientes desde Google News RSS (Tenis en Español)
async function fetchLatestTennisNews() {
  const rssUrl = 'https://news.google.com/rss/search?q=tenis+ATP+OR+WTA&hl=es-419&gl=AR&ceid=AR:es-419';
  console.log('📡 Consultando RSS de tenis:', rssUrl);
  
  const res = await fetch(rssUrl);
  const xml = await res.text();
  
  const items = [];
  const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<description>(.*?)<\/description>[\s\S]*?<\/item>/g;
  
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
    const rawTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
    const cleanTitle = rawTitle.split(' - ')[0]; // Remueve el nombre del diario al final
    const link = match[2];
    const pubDate = match[3];
    const rawDesc = match[4].replace(/<[^>]*>?/gm, '').trim();
    
    items.push({
      title: cleanTitle,
      link,
      pubDate,
      description: rawDesc
    });
  }
  
  return items;
}

// 2. Generar artículo original periodístico utilizando Gemini
async function generateArticleWithGemini(newsItem) {
  if (!GEMINI_API_KEY) {
    console.log('⚠️ GEMINI_API_KEY no detectada. Generando artículo con plantilla estructurada.');
    return generateFallbackArticle(newsItem);
  }

  const prompt = `
Actúa como un periodista deportivo especializado en tenis para el medio "DobleFalta".
A partir de este hecho/noticia reciente:
Título: "${newsItem.title}"
Detalles: "${newsItem.description}"

Escribe una crónica o artículo analítico original, riguroso y en español rioplatense neutro.
Debe tener exactamente este formato JSON (sin texto adicional ni markdown \`\`\`json):
{
  "title": "Título llamativo y periodístico de máximo 80 caracteres",
  "slug": "slug-url-amigable-en-kebab-case",
  "excerpt": "Un resumen breve de 2 oraciones para la portada",
  "category": "Una de: ATP, WTA, Grand Slams, Tenis Argentino, Análisis Táctico",
  "readTime": "4 min",
  "content": "<p>Primer párrafo de introducción y contexto...</p><h2>Subtítulo de análisis</h2><p>Segundo párrafo con estadísticas, impacto en el ranking ATP y sensaciones...</p><h2>Lo que se viene</h2><p>Tercer párrafo con próximos desafíos y conclusión...</p>"
}

Requisitos estrictos:
1. Mínimo 350 palabras dentro de "content".
2. Redacción 100% original con tono profesional.
3. El campo "content" debe ser HTML válido usando <p>, <h2>, <strong> y <ul> si corresponde.
4. Responde ÚNICAMENTE con el objeto JSON.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Limpiar posibles bloques markdown ```json ... ```
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

// Generador de respaldo si no hay API Key de Gemini
function generateFallbackArticle(newsItem) {
  const slug = newsItem.title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    title: newsItem.title,
    slug: slug.substring(0, 70),
    excerpt: `Repaso detallado y análisis sobre las novedades más recientes en el circuito internacional: ${newsItem.title}.`,
    category: 'ATP',
    readTime: '3 min',
    content: `
      <p>El circuito profesional no detiene su marcha y cada jornada de competencia ofrece momentos cruciales para los jugadores que buscan escalar posiciones en el escalafón mundial. En esta oportunidad, <strong>${newsItem.title}</strong> se posiciona como uno de los temas más comentados de la fecha.</p>
      <h2>Impacto en el Ranking y rendimiento</h2>
      <p>Cada victoria en esta instancia resulta determinante para la suma de puntos en la tabla rodante de 52 semanas. Mantener la regularidad táctica y la eficacia con el primer servicio resultan las variables indispensables para sostenerse en la élite del deporte de raqueta.</p>
      <h2>Expectativas y próximos compromisos</h2>
      <p>Con la mirada puesta en las siguientes rondas del certamen, los aficionados siguen de cerca el desarrollo de cada cruce a través de DobleFalta con marcadores punto a punto y estadísticas actualizadas minuto a minuto.</p>
    `
  };
}

async function main() {
  console.log('🚀 Iniciando proceso de generación automatizada de noticias DobleFalta...');
  
  try {
    const rawNews = await fetchLatestTennisNews();
    if (!rawNews.length) {
      console.log('No se encontraron noticias en el feed RSS.');
      return;
    }

    // Tomamos la noticia más relevante
    const targetItem = rawNews[0];
    console.log(`📝 Procesando tema: "${targetItem.title}"`);

    const articleData = await generateArticleWithGemini(targetItem);
    
    // Asignar metadatos adicionales
    const today = new Date().toISOString().split('T')[0];
    const randomImage = TENNIS_IMAGES[Math.floor(Math.random() * TENNIS_IMAGES.length)];

    const finalDoc = {
      ...articleData,
      publishedAt: today,
      author: 'Redacción DobleFalta',
      imageUrl: articleData.imageUrl || randomImage,
      sourceUrl: targetItem.link || '',
      createdAt: new Date().toISOString()
    };

    const docId = finalDoc.slug || `news-${Date.now()}`;
    console.log(`💾 Guardando en Firestore colección 'news' con ID: ${docId}`);

    await setDoc(doc(db, 'news', docId), finalDoc);

    console.log('✅ ¡Artículo guardado exitosamente en Firestore!');
    console.log(`Título: "${finalDoc.title}"`);
    console.log(`URL local: /noticias/${docId}`);
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  }
}

main();

