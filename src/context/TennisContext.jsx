import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchFromApi } from '../services/tennisApi';
import { COUNTRY_CODES } from '../constants/tennis';

const TennisContext = createContext();

const fetchingKeys = new Set();
const requestQueue = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const batch = requestQueue.splice(0, 3); // Max 3 concurrent requests
    await Promise.allSettled(batch.map(async (task) => {
      await task();
      await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay between requests
    }));
  }

  isProcessingQueue = false;
};

export const TennisProvider = ({ children }) => {
  const [playerProfiles, setPlayerProfiles] = useState(() => {
    // Version v6 to force fresh fetch and clear old mismatches
    const saved = localStorage.getItem('tennis_player_profiles_v6');
    return saved ? JSON.parse(saved) : {};
  });

  const [atpRankings, setAtpRankings] = useState([]);
  const [wtaRankings, setWtaRankings] = useState([]);
  const [rankingMap, setRankingMap] = useState({});

  useEffect(() => {
    localStorage.setItem('tennis_player_profiles_v6', JSON.stringify(playerProfiles));
  }, [playerProfiles]);

  const fetchPlayerProfile = async (playerKey) => {
    if (!playerKey) return;
    const existing = playerProfiles[playerKey];
    
    // Safety check: if code is missing, we must refetch
    if (existing && existing.fullProfileFetched && existing.code) return;

    if (fetchingKeys.has(playerKey)) return;
    fetchingKeys.add(playerKey);

    const task = async () => {
      try {
        const result = await fetchFromApi('get_players', { player_key: playerKey });
        
        if (result.success === 1 && result.result?.length > 0) {
          const p = result.result[0];
          const countryName = p.player_country || '';
          
          // 1. Try exact match
          let code = COUNTRY_CODES[countryName] || '';
          
          // 2. Try cleaning (e.g. "USA (Hard)" -> "USA")
          if (!code && countryName) {
             const cleanName = countryName.split(/[\s(]/)[0].trim();
             code = COUNTRY_CODES[cleanName] || '';
          }
          
          // 3. Last resort: specific overrides for tricky API names
          if (!code) {
             if (countryName.includes('United States')) code = 'us';
             if (countryName.includes('Great Britain')) code = 'gb';
             if (countryName.includes('Russian')) code = 'ru';
          }

          setPlayerProfiles(prev => ({
            ...prev,
            [playerKey]: { 
              country: countryName, 
              code: code, 
              logo: p.player_logo || '', 
              rank: rankingMap[playerKey.toString()] || '-',
              fullProfileFetched: true 
            }
          }));
        } else {
          setPlayerProfiles(prev => ({
            ...prev,
            [playerKey]: { ...(prev[playerKey] || {}), fullProfileFetched: true }
          }));
        }
      } catch (e) {
        console.warn("Error fetching player profile", e);
        fetchingKeys.delete(playerKey); // allow retry
      }
    };

    requestQueue.push(task);
    processQueue();
  };

  const fetchAllRankings = async () => {
    try {
      const [atpRes, wtaRes] = await Promise.all([
        fetchFromApi('get_standings', { event_type: 'ATP' }),
        fetchFromApi('get_standings', { event_type: 'WTA' })
      ]);
      
      const combinedMap = {};
      if (atpRes.success === 1 && atpRes.result) {
        setAtpRankings(atpRes.result);
        atpRes.result.forEach(r => {
          if (r.player_key) combinedMap[r.player_key.toString()] = r.place;
        });
      }
      if (wtaRes.success === 1 && wtaRes.result) {
        setWtaRankings(wtaRes.result);
        wtaRes.result.forEach(r => {
          if (r.player_key) combinedMap[r.player_key.toString()] = r.place;
        });
      }
      setRankingMap(combinedMap);
    } catch (e) {
      console.warn("Error fetching rankings:", e);
    }
  };

  useEffect(() => {
    fetchAllRankings();
  }, []);

  return (
    <TennisContext.Provider value={{
      playerProfiles,
      setPlayerProfiles,
      fetchPlayerProfile,
      atpRankings,
      wtaRankings,
      rankingMap
    }}>
      {children}
    </TennisContext.Provider>
  );
};

export const useTennis = () => {
  const context = useContext(TennisContext);
  if (!context) throw new Error('useTennis must be used within a TennisProvider');
  return context;
};
