import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import {
  doc, getDoc, collection, query, orderBy,
  onSnapshot, addDoc, serverTimestamp, updateDoc, increment
} from 'firebase/firestore';

const CommunityThread = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [nickname, setNickname] = useState(() => localStorage.getItem('df_forum_nickname') || '');
  const [posting, setPosting] = useState(false);

  // Cargar el tema
  useEffect(() => {
    if (!threadId) return;
    getDoc(doc(db, 'topics', threadId)).then(snap => {
      if (snap.exists()) setTopic({ id: snap.id, ...snap.data() });
      setLoadingTopic(false);
      // Incrementar vistas
      updateDoc(doc(db, 'topics', threadId), { views: increment(1) }).catch(() => {});
    }).catch(() => setLoadingTopic(false));
  }, [threadId]);

  // Escuchar respuestas en tiempo real
  useEffect(() => {
    if (!threadId) return;
    const q = query(collection(db, 'topics', threadId, 'replies'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [threadId]);

  const formatDate = (ts) => {
    if (!ts) return 'Ahora';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || !nickname.trim() || posting) return;
    setPosting(true);
    localStorage.setItem('df_forum_nickname', nickname.trim());
    try {
      await addDoc(collection(db, 'topics', threadId, 'replies'), {
        author: nickname.trim(),
        content: newReply.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'topics', threadId), { repliesCount: increment(1) });
      setNewReply('');
    } catch (err) {
      console.error('Error al publicar:', err);
    }
    setPosting(false);
  };

  if (loadingTopic) {
    return <div style={{ padding: '40px', color: '#aaa', textAlign: 'center' }}>Cargando debate...</div>;
  }
  if (!topic) {
    return <div style={{ padding: '40px', color: '#aaa', textAlign: 'center' }}>Tema no encontrado.</div>;
  }

  return (
    <div className="detail-view" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
      <button className="back-btn" style={{ marginBottom: '20px' }} onClick={() => navigate('/comunidad')}>← VOLVER AL FORO</button>

      {/* Hilo principal */}
      <div style={{ background: 'var(--clay-dark)', padding: '25px', borderRadius: '8px', borderLeft: '4px solid var(--ball-yellow)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <span style={{ color: 'var(--ball-yellow)', fontWeight: 'bold' }}>HILO PRINCIPAL</span>
          <span style={{ color: '#888', fontSize: '0.85rem' }}>{formatDate(topic.createdAt)}</span>
        </div>
        <h1 style={{ margin: '0 0 15px 0', fontSize: '1.8rem' }}>{topic.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
          <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {topic.author.substring(0, 1).toUpperCase()}
          </div>
          <div style={{ color: '#ccc', fontWeight: 'bold' }}>{topic.author}</div>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#aaa' }}>{topic.category}</span>
        </div>
        <p style={{ lineHeight: '1.6', fontSize: '1.05rem', color: '#e0e0e0' }}>{topic.excerpt}</p>
      </div>

      <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px', color: '#aaa' }}>
        {replies.length} Respuestas
      </h3>

      {/* Lista de respuestas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
        {replies.map(reply => (
          <div key={reply.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#333', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  {reply.author.substring(0, 1).toUpperCase()}
                </div>
                <span style={{ color: 'var(--ball-yellow)', fontWeight: 'bold', fontSize: '0.9rem' }}>{reply.author}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>{formatDate(reply.createdAt)}</span>
            </div>
            <p style={{ margin: 0, paddingLeft: '38px', lineHeight: '1.5', color: '#ddd' }}>{reply.content}</p>
          </div>
        ))}
        {replies.length === 0 && (
          <p style={{ color: '#666' }}>Todavía no hay respuestas. ¡Sé el primero en opinar!</p>
        )}
      </div>

      {/* Formulario */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h4 style={{ margin: '0 0 15px 0' }}>Participar en este debate</h4>
        <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Tu Nombre o Nickname (Ej: FanTenis23)"
            required
            style={{ width: '100%', padding: '12px 15px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '6px', fontFamily: 'inherit', outline: 'none', fontSize: '0.95rem' }}
          />
          <textarea
            value={newReply}
            onChange={e => setNewReply(e.target.value)}
            placeholder="Escribe tu opinión aquí..."
            required
            style={{ width: '100%', minHeight: '120px', padding: '15px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '6px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', fontSize: '0.95rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={!newReply.trim() || !nickname.trim() || posting}
              className={`main-header-block_button ${(newReply.trim() && nickname.trim() && !posting) ? 'active' : ''}`}
              style={{ opacity: (newReply.trim() && nickname.trim() && !posting) ? 1 : 0.5, cursor: (newReply.trim() && nickname.trim() && !posting) ? 'pointer' : 'not-allowed' }}
            >
              {posting ? 'PUBLICANDO...' : 'PUBLICAR COMENTARIO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityThread;
