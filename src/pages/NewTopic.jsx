import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const categories = [
  'Debate General',
  'Tenis Argentino',
  'Reglas y Rankings',
  'Copa Davis',
  'Grand Slams',
  'Circuitos Challenger e ITF',
];

const NewTopic = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState(() => localStorage.getItem('df_forum_nickname') || '');
  const [posting, setPosting] = useState(false);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !nickname.trim() || posting) return;
    setPosting(true);
    localStorage.setItem('df_forum_nickname', nickname.trim());
    try {
      const docRef = await addDoc(collection(db, 'topics'), {
        title: title.trim(),
        author: nickname.trim(),
        category,
        excerpt: content.trim(),
        repliesCount: 0,
        views: 1,
        createdAt: serverTimestamp(),
      });
      navigate(`/comunidad/${docRef.id}`);
    } catch (err) {
      console.error('Error al crear el tema:', err);
      setPosting(false);
    }
  };

  const isValid = title.trim() && content.trim() && nickname.trim();

  return (
    <div className="detail-view" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <button className="back-btn" style={{ marginBottom: '20px' }} onClick={() => navigate('/comunidad')}>← CANCELAR</button>

      <div style={{ background: 'var(--clay-dark)', padding: '30px', borderRadius: '8px', borderTop: '4px solid var(--ball-yellow)' }}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '1.8rem', color: 'var(--ball-yellow)' }}>Crear Nuevo Tema</h1>
        <p style={{ color: '#aaa', marginBottom: '25px', fontSize: '0.9rem' }}>
          Inicia un nuevo hilo de debate. Mantén un lenguaje respetuoso y asegúrate de elegir la sección correcta.
        </p>

        <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ccc' }}>Título del Tema</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: ¿Qué opinan del nivel de los torneos actuales?"
              required
              style={{ width: '100%', padding: '12px 15px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ccc' }}>Sección / Categoría</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ccc' }}>Tu Nombre / Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Tu apodo para mostrar"
              required
              style={{ width: '100%', padding: '12px 15px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ccc' }}>Mensaje Inicial</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Desarrolla aquí tu idea o pregunta..."
              required
              style={{ width: '100%', minHeight: '150px', padding: '15px', background: '#111', border: '1px solid #333', color: 'white', borderRadius: '6px', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={!isValid || posting}
              className={`main-header-block_button ${isValid && !posting ? 'active' : ''}`}
              style={{ opacity: isValid && !posting ? 1 : 0.5, cursor: isValid && !posting ? 'pointer' : 'not-allowed', padding: '12px 24px', fontSize: '1rem' }}
            >
              {posting ? 'PUBLICANDO...' : 'PUBLICAR TEMA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTopic;
