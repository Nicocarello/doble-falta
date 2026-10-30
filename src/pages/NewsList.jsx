import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { Newspaper, Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import SEO from '../components/common/SEO';
import AdBlock from '../components/common/AdBlock';

// Artículos iniciales de alto valor periodístico para AdSense
export const SEED_NEWS = [
  {
    id: 'como-funciona-sistema-puntos-ranking-atp',
    slug: 'como-funciona-sistema-puntos-ranking-atp',
    title: 'Guía Completa: Cómo funciona el sistema de puntos y el Ranking ATP',
    excerpt: 'El ranking de la ATP es el termómetro del tenis mundial. Te explicamos en detalle cómo se defienden puntos cada semana, el corte de las 52 semanas y la jerarquía de los torneos.',
    category: 'Reglas y Análisis',
    readTime: '5 min',
    publishedAt: '2026-10-25',
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    content: `
      <p>El Ranking Pepperstone ATP es la clasificación oficial que determina el acceso a los cuadros principales y cabezas de serie en todos los certámenes del circuito mundial. Aunque muchos fanáticos siguen semana a semana las posiciones de sus tenistas favoritos, comprender su matemática exacta resulta fundamental para entender la estrategia del calendario.</p>
      
      <h2>El principio de las 52 semanas</h2>
      <p>El ranking mundial opera bajo un sistema rodante de 52 semanas (a excepción de las ATP Finals). Esto significa que los puntos acumulados por un jugador en un torneo específico caducan exactamente un año después. Cuando un tenista disputa un campeonato que ganó la temporada anterior, se dice que "defiende" los puntos: si vuelve a campeonar, no suma unidades nuevas; si cae antes de la final, pierde la diferencia en la tabla.</p>
      
      <h2>La escala de torneos: De Grand Slams a Challengers</h2>
      <p>Los puntos otorgados dependen estrictamente de la jerarquía de cada certamen:</p>
      <ul>
        <li><strong>Grand Slams (Australian Open, Roland Garros, Wimbledon, US Open):</strong> El campeón recibe 2.000 puntos. El finalista suma 1.300 y los semifinalistas 800.</li>
        <li><strong>ATP Masters 1000:</strong> Otorgan 1.000 puntos al ganador (Indian Wells, Miami, Montecarlo, Madrid, Roma, Canadá, Cincinnati, Shanghai y París).</li>
        <li><strong>ATP 500 y ATP 250:</strong> Entregan 500 y 250 puntos respectivamente, vitales para el ascenso de jugadores intermedios.</li>
        <li><strong>Challenger Tour:</strong> Categorías 175, 125, 100, 75 y 50, semillero indiscutible de las futuras estrellas del tenis latinoamericano.</li>
      </ul>

      <h2>El mejor de 19 torneos</h2>
      <p>Un jugador no puede sumar infinitamente jugando certámenes sin parar. La puntuación total de un singlista se computa sumando los mejores resultados en un máximo de 19 torneos (o 20 si clasifica a las Nitto ATP Finals), con participación obligatoria en los cuatro Majors y en los Masters 1000 correspondientes.</p>
    `
  },
  {
    id: 'argentinos-circuito-atp-desafio-polvo-ladrillo',
    slug: 'argentinos-circuito-atp-desafio-polvo-ladrillo',
    title: 'El presente de la Legión Argentina: Consolidación y recambio en la élite',
    excerpt: 'Con Sebastián Báez y Francisco Cerúndolo a la cabeza, analizamos la temporada del tenis argentino en el circuito mayor y los jóvenes que vienen empujando fuerte.',
    category: 'Tenis Argentino',
    readTime: '4 min',
    publishedAt: '2026-10-22',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
    content: `
      <p>El tenis argentino continúa demostrando una vigencia notable en el circuito internacional. A pesar de las distancias geográficas y los desafíos presupuestarios para viajar a Europa y Norteamérica, una sólida camada de tenistas nacidos a principios de los años 2000 ha logrado consolidarse entre los mejores cincuenta del planeta.</p>
      
      <h2>Sebastián Báez y la madurez táctica</h2>
      <p>Báez ha ratificado su condición de especialista indiscutido sobre pistas lentas. Con múltiples títulos ATP en su palmarés, su agresividad con el drive y su sobresaliente movilidad lo convierten en una amenaza real para cualquier rival del top 10 en la gira europea de arcilla.</p>
      
      <h2>Francisco Cerúndolo: Potencia y versatilidad</h2>
      <p>Por su parte, Francisco Cerúndolo representa el perfil de tenista moderno y potente. Capaz de desbordar con su derecha tanto en tierra batida como en cemento y césped (como lo demostró en torneos como Eastbourne y Miami), su techo de rendimiento se ubica en las etapas definitorias de los grandes torneos.</p>
      
      <h2>El empuje del Challenger Tour</h2>
      <p>Detrás de los nombres consolidados, la organización de torneos Challenger en Buenos Aires, Córdoba, Santa Fe y otras ciudades de la región permite que promesas jóvenes sumen sus primeros puntos ATP sin afrontar los costosos viajes intercontinentales desde sus primeros pasos.</p>
    `
  },
  {
    id: 'superficies-tenis-diferencias-estrategia-rebote',
    slug: 'superficies-tenis-diferencias-estrategia-rebote',
    title: 'Polvo de ladrillo vs. Cemento y Césped: Cómo influye la superficie en el juego',
    excerpt: 'De la velocidad y resbalones en arcilla a la explosividad del césped de Wimbledon. Descubrí cómo la física de cada cancha transforma la táctica de los jugadores.',
    category: 'Análisis Táctico',
    readTime: '6 min',
    publishedAt: '2026-10-18',
    imageUrl: 'https://images.unsplash.com/photo-1530915534664-4ac642379740?auto=format&fit=crop&w=800&q=80',
    content: `
      <p>Ningún otro deporte individual experimenta una mutación tan radical según el terreno de juego como el tenis. El calendario profesional exige a los deportistas adaptarse sucesivamente a tres superficies completamente disímiles: tierra batida (polvo de ladrillo), pistas duras (cemento o resina sintética) y hierba natural.</p>
      
      <h2>Polvo de ladrillo: Resistencia y construcción del punto</h2>
      <p>La arcilla es la superficie más lenta del circuito. La pelota pierde una porción significativa de su velocidad horizontal al impactar el suelo, pero genera un pique alto y con mucho efecto (topspin). Esto neutraliza los saques devastadores y premia la paciencia táctica, la condición aeróbica y la capacidad de deslizarse antes de golpear.</p>
      
      <h2>Pistas duras: El estándar del circuito moderno</h2>
      <p>El cemento alberga más del 60% de los torneos anuales, incluidos el Australian Open y el US Open. Ofrece un bote predecible y uniforme, favoreciendo tanto a sacadores agresivos como a contragolpeadores sólidos desde el fondo. Sin embargo, su dureza somete a las rodillas y tobillos a un desgaste articular severo.</p>
      
      <h2>Césped: Milisegundos y reflejos puros</h2>
      <p>La gira sobre hierba es la más breve del calendario, coronada por la mística de Wimbledon. La pelota pica bajísimo y resbala hacia adelante, acelerando el juego. El servicio y la volea, la anticipación y los tiros con slice son herramientas vitales para salir victorioso en césped.</p>
    `
  }
];

const NewsList = () => {
  const [articles, setArticles] = useState(SEED_NEWS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('TODAS');

  useEffect(() => {
    // Escuchar artículos desde Firestore
    const newsRef = collection(db, 'news');
    const q = query(newsRef, orderBy('publishedAt', 'desc'));

    const unsubscribe = onSnapshot(newsRef, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreArticles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArticles(firestoreArticles);
      }
    }, (error) => {
      console.warn("Firestore news note (using seed fallback):", error);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['TODAS', 'Reglas y Análisis', 'Tenis Argentino', 'Análisis Táctico', 'ATP'];

  const filteredArticles = selectedCategory === 'TODAS'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div className="news-page" style={{ padding: '20px 15px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <SEO
        title="Noticias, Análisis y Crónicas de Tenis - DobleFalta"
        description="Crónicas originales, guías del circuito ATP, análisis del ranking y actualidad del tenis argentino e internacional en DobleFalta."
      />

      <header style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ball-yellow)', fontSize: '1.8rem', margin: '0 0 10px 0' }}>
          <Newspaper size={30} /> Actualidad y Crónicas de Tenis
        </h1>
        <p style={{ color: '#bbb', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>
          Análisis profundos del circuito ATP/WTA, evolución del ranking, táctica y el seguimiento de los protagonistas del deporte blanco.
        </p>

        {/* Filtros de categoría */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--clay-orange)' : 'rgba(255,255,255,0.06)',
                color: selectedCategory === cat ? '#fff' : '#ccc',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat ? '700' : '500',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Grid de Noticias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        {filteredArticles.map((article) => (
          <article
            key={article.id || article.slug}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, border-color 0.2s'
            }}
          >
            {article.imageUrl && (
              <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(18,20,23,0.85)',
                  color: 'var(--ball-yellow)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  backdropFilter: 'blur(4px)'
                }}>
                  {article.category || 'Tenis'}
                </span>
              </div>
            )}

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#888', fontSize: '0.78rem', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} /> {article.publishedAt}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} /> {article.readTime || '4 min'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.2rem', lineHeight: '1.4', margin: '0 0 12px 0', color: '#fff' }}>
                <Link
                  to={`/noticias/${article.slug || article.id}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {article.title}
                </Link>
              </h2>

              <p style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 18px 0', flexGrow: 1 }}>
                {article.excerpt}
              </p>

              <Link
                to={`/noticias/${article.slug || article.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--ball-yellow)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  marginTop: 'auto'
                }}
              >
                Leer nota completa <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Espacio publicitario */}
      <AdBlock slot="" />
    </div>
  );
};

export default NewsList;

