import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { Calendar, Clock, ArrowLeft, Tag, Share2, User } from 'lucide-react';
import SEO from '../components/common/SEO';
import AdBlock from '../components/common/AdBlock';
import { SEED_NEWS } from './NewsList';

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchArticle = async () => {
      setLoading(true);
      try {
        // 1. Primero chequear en SEED_NEWS
        const localMatch = SEED_NEWS.find(a => a.slug === slug || a.id === slug);
        if (localMatch) {
          setArticle(localMatch);
          setLoading(false);
          return;
        }

        // 2. Si no está en SEED, buscar en Firestore
        const docRef = doc(db, 'news', slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Intentar buscar por campo slug
          const newsColl = collection(db, 'news');
          const snap = await getDocs(newsColl);
          const found = snap.docs.find(d => d.data().slug === slug);
          if (found) {
            setArticle({ id: found.id, ...found.data() });
          } else {
            setArticle(null);
          }
        }
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#888' }}>
        <p>Cargando artículo...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#fff' }}>
        <h2>Artículo no encontrado</h2>
        <p style={{ color: '#888', margin: '15px 0' }}>El artículo que estás buscando no existe o fue movido.</p>
        <Link to="/noticias" style={{ color: 'var(--ball-yellow)', textDecoration: 'underline' }}>
          Volver a todas las noticias
        </Link>
      </div>
    );
  }

  return (
    <article className="news-detail" style={{ padding: '25px 20px', maxWidth: '820px', margin: '0 auto', color: '#fff', lineHeight: '1.8' }}>
      <SEO
        title={`${article.title} - DobleFalta`}
        description={article.excerpt}
        image={article.imageUrl}
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
          <ArrowLeft size={16} /> Volver a Noticias
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
            {article.category || 'Actualidad'}
          </span>
        </div>

        <h1 style={{ fontSize: '2.1rem', lineHeight: '1.3', margin: '0 0 16px 0', color: '#fff' }}>
          {article.title}
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#bbb', lineHeight: '1.6', margin: '0 0 20px 0', fontStyle: 'italic' }}>
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
          />
        </div>
      )}

      {/* Contenido del Artículo */}
      <div
        className="article-body"
        style={{
          fontSize: '1.05rem',
          color: '#d6d6d6',
          lineHeight: '1.85'
        }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Bloque de Anuncio publicitario en el artículo */}
      <div style={{ margin: '40px 0' }}>
        <AdBlock slot="" />
      </div>

      <footer style={{
        marginTop: '50px',
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
          ← Ver más artículos de DobleFalta
        </Link>
        <div style={{ color: '#888', fontSize: '0.82rem' }}>
          DobleFalta © {new Date().getFullYear()} • Periodismo y estadísticas de tenis
        </div>
      </footer>
    </article>
  );
};

export default NewsDetail;

