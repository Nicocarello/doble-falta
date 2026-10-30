export const getMatchStatus = (m) => {
  const s = (m.event_status || '').toLowerCase();
  const isLive = m.event_live === '1';
  if (s.includes('finish')) return 'FIN';
  if (s.includes('retir')) return 'RET';
  if (s.includes('walkover') || s.includes('w/o')) return 'W/O';
  if (s.includes('cancel')) return 'CANC';
  if (s.includes('susp') || s.includes('interrup') || s.includes('rain') || s.includes('abandon')) return 'SUSP';
  if (s.includes('postpon')) return 'REPROG';
  if (isLive) return 'LIVE';
  return '';
};

export const parseSetScore = (val) => {
  if (!val) return { games: '', tb: null };
  const parts = val.toString().split('.');
  return {
    games: parts[0],
    tb: parts[1] || null
  };
};

export const USER_TIMEZONE = 'America/Argentina/Buenos_Aires';

export const getTodayART = () => {
  const d = new Date();
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: USER_TIMEZONE }).format(d);
  const month = new Intl.DateTimeFormat('en-US', { month: '2-digit', timeZone: USER_TIMEZONE }).format(d);
  const day = new Intl.DateTimeFormat('en-US', { day: '2-digit', timeZone: USER_TIMEZONE }).format(d);
  return `${year}-${month}-${day}`;
};

export const parseRound = (tournamentRound, isQualy = false) => {
  if (!tournamentRound) return '';

  const fullStr = tournamentRound.toString();
  const parts = fullStr.split(' - ');
  const raw = (parts[parts.length - 1] || '').trim().toLowerCase();

  if (!raw) return '';

  // Ordered from most specific to least specific
  const roundPatterns = [
    ['1/64-finals', '1ra Ronda'],
    ['1/32-finals', '2da Ronda'],
    ['1/16-finals', '3ra Ronda'],
    ['1/8-finals', '8vos'],
    ['1/4-finals', '4tos'],
    ['quarter-finals', '4tos'],
    ['semi-finals', 'Semifinal'],
    ['qualifying 1', 'Q1'],
    ['qualifying 2', 'Q2'],
    ['qualifying 3', 'Q3'],
    ['qualification 1', 'Q1'],
    ['qualification 2', 'Q2'],
    ['qualification 3', 'Q3'],
    ['qualifying', 'Clasificación'],
    ['qualification', 'Clasificación'],
    ['round robin', 'Round Robin'],
    ['1st round', '1ra Ronda'],
    ['2nd round', '2da Ronda'],
    ['3rd round', '3ra Ronda'],
    ['4th round', '4ta Ronda'],
    ['round 1', '1ra Ronda'],
    ['round 2', '2da Ronda'],
    ['round 3', '3ra Ronda'],
    ['round 4', '4ta Ronda'],
    ['final', 'Final'],
  ];

  let label = '';
  
  // 1. Try exact match
  for (const [pattern, l] of roundPatterns) {
    if (raw === pattern || raw === pattern + 's') {
      label = l;
      break;
    }
  }

  // 2. Try partial match
  if (!label) {
    for (const [pattern, l] of roundPatterns) {
      if (raw.includes(pattern)) {
        label = l;
        break;
      }
    }
  }

  // 3. Fallback
  if (!label) {
    label = parts[parts.length - 1].trim();
  }

  // Special Check: If it's a qualifying round (and not already labeled as such)
  // We check both the explicit flag and if "qualifying" is in the string
  const isQualyMatch = isQualy || 
                       fullStr.toLowerCase().includes('qualifying') || 
                       fullStr.toLowerCase().includes('qualification');
  
  if (isQualyMatch && label !== 'Clasificación' && !label.startsWith('Q')) {
    return `${label}\nQUALY`;
  }

  return label;
};

export const filterEmptySets = (scores, status) => {
  if (!Array.isArray(scores) || scores.length === 0) return [];
  
  const isFinished = ['FIN', 'RET', 'W/O', 'CANC'].includes(status);
  
  // Buscamos el último set que tenga algún puntaje distinto de 0
  let lastInvolvedIndex = -1;
  for (let i = 0; i < scores.length; i++) {
    const s1 = String(scores[i].score_first || '0');
    const s2 = String(scores[i].score_second || '0');
    if (s1 !== '0' || s2 !== '0') {
      lastInvolvedIndex = i;
    }
  }

  if (isFinished) {
    // Si terminó, solo mostramos hasta el último set con data
    if (lastInvolvedIndex === -1) return [scores[0]];
    return scores.slice(0, lastInvolvedIndex + 1);
  }

  // Si está en vivo o programado, mostramos hasta el último con data + 1 (el set actual)
  // Pero nunca menos del primero
  const endSlice = Math.max(1, lastInvolvedIndex + 2);
  return scores.slice(0, Math.min(scores.length, endSlice));
};

export const isJuniorMatch = (match) => {
  if (!match) return false;
  const ett = (match.event_type_type || '').toLowerCase();
  const tn = (match.tournament_name || '').toLowerCase();
  const tr = (match.tournament_round || '').toLowerCase();
  const key = Number(match.event_type_key);
  return (
    [277, 278, 279, 280].includes(key) ||
    /\b(boys|girls|junior|juniors|juniorka)\b/i.test(ett) ||
    /\b(boys|girls|junior|juniors|juniorka)\b/i.test(tn) ||
    /\b(boys|girls|junior|juniors|juniorka)\b/i.test(tr)
  );
};
