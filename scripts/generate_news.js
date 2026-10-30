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
  while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
    const rawTitle = match[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
    const cleanTitle = rawTitle.split(' - ')[0]; // Remueve el nombre del diario al final
    const link = match[2];
    const pubDate = match[3];
    const rawDesc = match[4].replace(/<[^>]*>?/gm, '').trim();
    
    // Filtro de calidad: descartar preguntas genéricas, horarios ("a qué hora", "dónde ver") y títulos demasiado cortos
    const lower = cleanTitle.toLowerCase();
    const isQuestion = cleanTitle.includes('?') || cleanTitle.includes('¿');
    const isSchedule = lower.includes('a qué hora') || lower.includes('donde ver') || lower.includes('dónde ver') || lower.includes('cómo ver');
    const isTooShort = cleanTitle.length < 25;

    if (!isQuestion && !isSchedule && !isTooShort) {
      items.push({
        title: cleanTitle,
        link,
        pubDate,
        description: rawDesc
      });
    }
  }
  
  return items;
}

// 2. Generar artículo original periodístico utilizando Gemini con búsqueda en tiempo real
async function generateArticleWithGemini(newsItem) {
  if (!GEMINI_API_KEY) {
    throw new Error('❌ GEMINI_API_KEY no está configurada en las variables de entorno. Para garantizar artículos de alta calidad con datos reales de tenis, se requiere la clave de Gemini.');
  }

  const prompt = `
Actúa como un periodista deportivo de élite especializado en tenis para el medio "DobleFalta".
A partir de este acontecimiento reciente del tenis internacional:
Título del suceso: "${newsItem.title}"

Tu misión es escribir una crónica periodística o artículo analítico COMPLETO, riguroso, profundo y con datos específicos (jugadores, torneos, sets, rivales, superficie, impacto en los puntos y el ranking ATP o WTA).
NO escribas generalidades vacías. Menciona nombres reales, contexto del torneo y datos técnicos concretos del juego.

Responde ÚNICAMENTE con un objeto JSON válido (sin formato markdown ni texto alrededor) con esta estructura exacta:
{
  "title": "Título periodístico y atractivo de máximo 80 caracteres",
  "slug": "slug-url-amigable-en-kebab-case",
  "excerpt": "Resumen conciso y sustancioso de 2 oraciones para la portada",
  "category": "Una de: ATP, WTA, Grand Slams, Tenis Argentino, Análisis Táctico",
  "readTime": "4 min",
  "content": "<p>Párrafo 1: Cobertura del hecho, nombres de los protagonistas y contexto...</p><h2>Claves del encuentro y rendimiento</h2><p>Párrafo 2: Detalles técnicos, saques, quiebres y estadísticas del partido...</p><h2>Impacto en el Ranking y lo que sigue</h2><p>Párrafo 3: Cómo repercute en los puntos de la tabla ATP/WTA y el próximo rival...</p>"
}

Requisitos estrictos:
1. Mínimo 400 palabras en el campo "content".
2. Redacción 100% original en español rioplatense neutro con calidad editorial.
3. El campo "content" debe ser HTML limpio con <p>, <h2>, <strong> y <ul> si aplica.
4. Responde ÚNICAMENTE con el JSON.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2500 }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Limpiar posibles bloques markdown ```json ... ```
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
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

