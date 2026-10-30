import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import {
  collection, query, orderBy, onSnapshot,
  doc, setDoc, serverTimestamp, updateDoc, increment
} from 'firebase/firestore';
import SEO from '../components/common/SEO';

// Temas iniciales que se migran a Firestore si la colección está vacía
const SEED_TOPICS = [
  {
    id: 'seed-1',
    title: '¿Quién será el verdadero sucesor del Big 3?',
    author: 'TenisFan99',
    category: 'Debate General',
    excerpt: 'Con el retiro inminente de las leyendas, el tenis mundial busca un nuevo rey indiscutido. Alcaraz, Sinner, Rune... ¿A quién ven con más solidez mental y física para dominar la próxima década?',
    repliesCount: 3,
    views: 340,
  },
  {
    id: 'seed-2',
    title: 'Seguimiento: Jugadores Argentinos en el Challenger Tour',
    author: 'DobleFaltaAdmin',
    category: 'Tenis Argentino',
    excerpt: 'Abro este hilo para ir comentando el desempeño de los chicos que están intentando dar el salto desde los torneos Challenger e ITF hacia los cuadros principales de la ATP...',
    repliesCount: 2,
    views: 215,
  },
  {
    id: 'seed-3',
    title: '¿Por qué el Ranking ATP beneficia tanto a los Grand Slams?',
    author: 'AceMaster',
    category: 'Reglas y Rankings',
    excerpt: 'Estaba analizando los puntajes y noto que llegar a semifinales de un M1000 da muchos menos puntos que avanzar algunas rondas en un Major. ¿Creen que el sistema es justo?',
    repliesCount: 2,
    views: 112,
    likesBase: 0,
  },
];

const Community = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatingId, setAnimatingId] = useState(null);

  // SVG Heart Icon
  const HeartIcon = ({ filled }) => (
    <svg 
      width="18" height="18" 
      viewBox="0 0 24 24" 
      fill={filled ? "#ff5252" : "transparent"} 
      stroke="#ff5252" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );

  useEffect(() => {
    const q = query(collection(db, 'topics'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        // Sembrar los temas iniciales en Firestore
        for (const t of SEED_TOPICS) {
          await setDoc(doc(db, 'topics', t.id), {
            ...t,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        setTopics(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    },
    () => setLoading(false)); // error handler
    return () => unsub();
  }, []);

  const formatDate = (ts) => {
    if (!ts) return 'Reciente';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleLike = async (e, topicId) => {
    e.stopPropagation();
    const likedArr = JSON.parse(localStorage.getItem('df_liked_topics') || '[]');
    if (likedArr.includes(topicId)) return; // Ya le dio like

    // Disparar animación
    setAnimatingId(topicId);
    setTimeout(() => setAnimatingId(null), 300);

    try {
      await updateDoc(doc(db, 'topics', topicId), {
        likesBase: increment(1)
      });
      localStorage.setItem('df_liked_topics', JSON.stringify([...likedArr, topicId]));
    } catch (err) {
      console.error("Error al dar like:", err);
    }
  };

  const localLiked = JSON.parse(localStorage.getItem('df_liked_topics') || '[]');

  return (
    <>
    <SEO 
      title="Comunidad y Foro de Tenis"
      description="Sumate al debate de tenis más grande de Argentina. Foro para analizar el circuito ATP, WTA, ranking de jugadores y seguir a los tenistas argentinos."
      keywords="foro tenis, comunidad tenis, debate tenis, ranking atp foro, tenis argentino debate, doble falta comunidad"
      canonicalUrl="/comunidad"
    />
    <style>{`
      @keyframes popLike {
        0% { transform: scale(1); }
        50% { transform: scale(1.4); }
        100% { transform: scale(1); }
      }
      .like-btn-anim {
        animation: popLike 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
    `}</style>
    <div className="detail-view" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--ball-yellow)', margin: 0, fontSize: '1.8rem' }}>Comunidad de Tenis</h1>
        <button
          className="main-header-block_button active"
          onClick={() => navigate('/comunidad/nuevo')}
          style={{ padding: '8px 16px', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          + NUEVO TEMA
        </button>
      </div>

      <p style={{ color: '#aaa', marginBottom: '25px', lineHeight: '1.5' }}>
        Bienvenidos al foro de DobleFalta. Un espacio para debatir sobre circuitos, analizar jugadores, compartir novedades del Ranking ATP y conversar sobre tenis mundial.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Cargando debates...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {topics.map(topic => (
            <div
              key={topic.id}
              onClick={() => navigate(`/comunidad/${topic.id}`)}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                borderLeft: '4px solid var(--ball-yellow)',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '4px', color: '#ccc' }}>
                  {topic.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{formatDate(topic.createdAt)}</span>
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#fff' }}>{topic.title}</h3>
              <p style={{ color: '#aaa', fontSize: '0.9rem', margin: '0 0 15px 0', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {topic.excerpt}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#666', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                <span style={{ color: '#999', fontWeight: 'bold' }}>Autor: {topic.author}</span>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <button 
                    onClick={(e) => handleLike(e, topic.id)}
                    className={animatingId === topic.id ? "like-btn-anim" : ""}
                    style={{ 
                      background: 'none', border: 'none', cursor: localLiked.includes(topic.id) ? 'default' : 'pointer',
                      color: '#ff5252',
                      display: 'flex', alignItems: 'center', gap: '5px', padding: 0, fontSize: '0.9rem',
                      transition: 'transform 0.1s'
                    }}>
                    <HeartIcon filled={localLiked.includes(topic.id)} /> {topic.likesBase || 0}
                  </button>
                  <span>💬 {topic.repliesCount || 0} Resp.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default Community;
