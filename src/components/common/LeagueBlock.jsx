import React from 'react';
import { useNavigate } from 'react-router-dom';
import MatchRow from './MatchRow';

const LeagueBlock = ({ league }) => {
  const navigate = useNavigate();
  
  return (
    <div className="league-block">
      <div
        className="league-name"
        onClick={() => {
          if (league.categoryId && league.tournamentId) {
            navigate(`/tournament/${league.categoryId}/${league.tournamentId}`, {
              state: {
                dynamicTournament: {
                  id: league.tournamentId,
                  apiKey: league.tournamentId,
                  name: league.leagueName,
                  city: '-', surface: '-', duration: '-'
                }
              }
            });
          }
        }}
        style={{ cursor: league.categoryId && league.tournamentId ? 'pointer' : 'default', display: 'flex' }}
      >
        {league.leagueName}
        {league.categoryId === 'Challenger' && league.tourType && (
          <span style={{
            marginLeft: '8px',
            background: league.tourType === 'WTA' ? '#e91e63' : '#2196f3',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            {league.tourType}
          </span>
        )}
        {league.categoryId && league.tournamentId && (
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.8, color: '#fff', textTransform: 'capitalize', fontWeight: 'normal' }}>
          </span>
        )}
      </div>
      <div className="games-list">
        {league.games.map(game => (
          <MatchRow key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};

export default LeagueBlock;
