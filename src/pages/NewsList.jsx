import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Newspaper, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import SEO from '../components/common/SEO';
import AdBlock from '../components/common/AdBlock';
import { SEED_NEWS } from '../data/editorialArticles';

export { SEED_NEWS };

const NewsList = () => {
  const [articles, setArticles] = useState(SEED_NEWS);
  const [selectedCategory, setSelectedCategory] = useState('TODAS');

  useEffect(() => {
    const newsRef = collection(db, 'news');
    const q = query(newsRef, orderBy('publishedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreArticles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Combinar crónicas diarias de Firestore con artículos editoriales de fondo sin duplicar slugs
        const seenSlugs = new Set(firestoreArticles.map(a => a.slug || a.id));
        const merged = [
          ...firestoreArticles,
          ...SEED_NEWS.filter(seed => !seenSlugs.has(seed.slug) && !seenSlugs.has(seed.id))
        ].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

        setArticles(merged);
      } else {
        setArticles(SEED_NEWS);
      }
    }, (error) => {
      console.warn("Firestore news listener fallback:", error);
      setArticles(SEED_NEWS);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['TODAS', 'Tenis Argentino', 'Historia y Leyendas', 'Reglas y Análisis', 'Análisis Táctico'];

  const filteredArticles = selectedCategory === 'TODAS'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div className="news-page" style={{ padding: '20px 15px', maxWidth: '1040px', margin: '0 auto', color: '#fff' }}>
      <SEO
        title="Noticias, Crónicas de Tenistas Argentinos y Análisis ATP/WTA - DobleFalta"
        description="Crónicas diarias de los tenistas argentinos en el circuito ATP, WTA y Challenger, historia de la Legión Argentina, análisis táctico y guías del ranking mundial en DobleFalta."
        canonicalUrl="/noticias"
      />

      <header style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ball-yellow)', fontSize: '1.85rem', margin: '0 0 10px 0' }}>
          <Newspaper size={30} /> Noticias, Crónicas Argentinas y Análisis de Tenis
        </h1>
        <p style={{ color: '#bbb', fontSize: '0.96rem', margin: 0, lineHeight: '1.65' }}>
          Cobertura periodística diaria del desempeño de los tenistas argentinos en torneos ATP, WTA y Challenger, junto a informes especiales sobre historia, reglamento y táctica del deporte blanco.
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
                padding: '7px 15px',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginBottom: '45px' }}>
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
              <div style={{ height: '185px', overflow: 'hidden', position: 'relative' }}>
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
                  background: 'rgba(18,20,23,0.88)',
                  color: 'var(--ball-yellow)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  backdropFilter: 'blur(4px)'
                }}>
                  {article.category || 'Tenis Argentino'}
                </span>
              </div>
            )}

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#888', fontSize: '0.78rem', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} /> {article.publishedAt}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} /> {article.readTime || '5 min'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.18rem', lineHeight: '1.4', margin: '0 0 12px 0', color: '#fff' }}>
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
                Leer crónica completa <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Sección Editorial de Contexto */}
      <section style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '28px 24px',
        marginBottom: '35px',
        lineHeight: '1.8',
        color: '#ccc'
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--ball-yellow)', fontSize: '1.3rem', marginTop: 0 }}>
          <BookOpen size={22} /> Sobre nuestra cobertura del Tenis Argentino e Internacional
        </h2>
        <p style={{ fontSize: '0.94rem', marginBottom: '12px' }}>
          En la redacción de <strong>DobleFalta</strong> realizamos un seguimiento diario exhaustivo de todos los representantes argentinos que compiten alrededor del mundo, abarcando desde los cuadros principales de <strong>Grand Slam y Masters 1000</strong> hasta las etapas decisivas del <strong>ATP Challenger Tour</strong> y los torneos profesionales de la <strong>ITF</strong>.
        </p>
        <p style={{ fontSize: '0.94rem', margin: 0 }}>
          Además de nuestras crónicas diarias de resultados, nuestra hemeroteca reúne guías técnicas sobre el funcionamiento matemático del ranking ATP y WTA, análisis biomecánicos sobre la influencia de cada superficie y semblanzas históricas de las grandes leyendas que forjaron la identidad del tenis nacional.
        </p>
      </section>

      <AdBlock slot="" />
    </div>
  );
};

export default NewsList;
