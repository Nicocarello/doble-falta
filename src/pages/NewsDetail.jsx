import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { db } from '../services/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Calendar, Clock, ArrowLeft, User, ArrowRight } from 'lucide-react';
import SEO from '../components/common/SEO';
import AdBlock from '../components/common/AdBlock';
import { SEED_NEWS } from '../data/editorialArticles';

function getInitialArticle(slug, stateArticle) {
  if (stateArticle && (stateArticle.slug === slug || stateArticle.id === slug)) {
    return stateArticle;
  }
  const localMatch = SEED_NEWS.find(a => a.slug === slug || a.id === slug);
  if (localMatch) return localMatch;

  if (typeof window !== 'undefined' && window.__PRERENDERED_ARTICLE__) {
    const pre = window.__PRERENDERED_ARTICLE__;
    if (pre.slug === slug || pre.id === slug) {
      return pre;
    }
  }
  return null;
}

const NewsDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const initialArticle = getInitialArticle(slug, location.state?.article);
  const [article, setArticle] = useState(initialArticle);
  const [loading, setLoading] = useState(!initialArticle);
  const [related, setRelated] = useState(() => SEED_NEWS.filter(a => a.slug !== slug).slice(0, 3));

  useEffect(() => {
    window.scrollTo(0, 0);

    const preloaded = getInitialArticle(slug, location.state?.article);
    if (preloaded) {
      setArticle(preloaded);
      setRelated(SEED_NEWS.filter(a => a.slug !== slug).slice(0, 3));
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'news', slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        } else {
          const newsColl = collection(db, 'news');
          const snap = await getDocs(newsColl);
          const found = snap.docs.find(d => d.data().slug === slug);
          if (found) {
            setArticle({ id: found.id, ...found.data() });
          } else {
            setArticle(null);
          }
        }

        setRelated(SEED_NEWS.slice(0, 3));
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, location.state]);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#888' }}>
        <p>Cargando crónica...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#fff' }}>
        <Helmet>
          <title>Artículo no encontrado - DobleFalta</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <h2>Artículo no encontrado</h2>
        <p style={{ color: '#888', margin: '15px 0' }}>El artículo que estás buscando no existe o fue movido.</p>
        <Link to="/noticias" style={{ color: 'var(--ball-yellow)', textDecoration: 'underline' }}>
          Volver a todas las noticias
        </Link>
      </div>
    );
  }

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
      "url": "https://doblefaltatenis.com.ar/about"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "DobleFalta",
      "url": "https://doblefaltatenis.com.ar"
    }
  };

  return (
    <article className="news-detail" style={{ padding: '25px 20px', maxWidth: '840px', margin: '0 auto', color: '#fff', lineHeight: '1.8' }}>
      <SEO
        title={`${article.title} - DobleFalta`}
        description={article.excerpt}
        image={article.imageUrl}
        canonicalUrl={`/noticias/${article.slug || article.id}`}
        type="article"
        schema={jsonLd}
      />

      <nav style={{ marginBottom: '25px' }}>
        <Link
          to="/noticias"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--ball-yellow)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <ArrowLeft size={16} /> Volver a Noticias y Crónicas
        </Link>
      </nav>

      <header style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <span style={{
            background: 'var(--clay-orange)',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: '14px',
            fontSize: '0.78rem',
            fontWeight: '700'
          }}>
            {article.category || 'Tenis Argentino'}
          </span>
        </div>

        <h1 style={{ fontSize: '2.05rem', lineHeight: '1.3', margin: '0 0 16px 0', color: '#fff' }}>
          {article.title}
        </h1>

        <p style={{ fontSize: '1.12rem', color: '#bbb', lineHeight: '1.6', margin: '0 0 20px 0', fontStyle: 'italic' }}>
          {article.excerpt}
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '20px',
          color: '#888',
          fontSize: '0.85rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 0'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={15} /> {article.author || 'Redacción DobleFalta'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} /> {article.publishedAt}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} /> {article.readTime || '5 min de lectura'}
          </span>
        </div>
      </header>

      {/* Imagen Principal */}
      {article.imageUrl && (
        <div style={{ marginBottom: '35px', borderRadius: '12px', overflow: 'hidden' }}>
          <img
            src={article.imageUrl}
            alt={article.title}
            style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }}
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Contenido del Artículo */}
      <div
        className="article-body"
        style={{
          fontSize: '1.05rem',
          color: '#dedede',
          lineHeight: '1.85'
        }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Bloque de Anuncio publicitario en el artículo */}
      <div style={{ margin: '40px 0' }}>
        <AdBlock slot="" />
      </div>

      {/* Lecturas Recomendadas */}
      {related.length > 0 && (
        <section style={{ marginTop: '45px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ color: 'var(--ball-yellow)', fontSize: '1.3rem', marginBottom: '20px' }}>
            Lecturas Recomendadas en DobleFalta
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
            {related.map(rel => (
              <Link
                key={rel.slug}
                to={`/noticias/${rel.slug}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                  textDecoration: 'none',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ball-yellow)', fontWeight: '700', textTransform: 'uppercase' }}>
                    {rel.category}
                  </span>
                  <h4 style={{ fontSize: '0.98rem', lineHeight: '1.4', margin: '8px 0 10px 0', color: '#fff' }}>
                    {rel.title}
                  </h4>
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--ball-yellow)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  Leer artículo <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer style={{
        marginTop: '40px',
        paddingTop: '25px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <Link
          to="/noticias"
          style={{
            color: 'var(--ball-yellow)',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '0.95rem'
          }}
        >
          ← Ver todas las noticias y crónicas
        </Link>
        <div style={{ color: '#888', fontSize: '0.82rem' }}>
          DobleFalta © {new Date().getFullYear()} • Periodismo y estadísticas de tenis
        </div>
      </footer>
    </article>
  );
};

export default NewsDetail;
