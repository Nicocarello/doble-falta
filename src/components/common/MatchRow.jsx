import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PlayerFlag from './PlayerFlag';
import { parseSetScore } from '../../utils/tennisHelpers';
import { useTennis } from '../../context/TennisContext';

const MatchRow = ({ game }) => {
  const navigate = useNavigate();
  const { rankingMap } = useTennis();
  
  return (
    <div className="match-row" onClick={() => navigate(`/match/${game.id}`, { state: { match: game } })}>
      <div className="status-cell">
        <StatusBadge status={game.status} time={game.time} />
        {game.round && <span className="round-tag">{game.round}</span>}
      </div>
      <div className="match-content">
        <div className="player-row">
          <div className={`player-name ${game.serving === 1 ? 'serving' : ''} ${game.winner === 'First Player' ? 'winner' : ''}`}>
            <PlayerFlag playerKey={game.p1Key} />
            {game.player1} {game.winner === 'First Player' && <span style={{ marginLeft: '4px', fontSize: '0.9rem' }}>✅</span>} {rankingMap[game.p1Key] && <span className="player-rank">({rankingMap[game.p1Key]})</span>}
          </div>
          <div className="score-sequence">
            {game.p1Sets.map((s, i) => {
              const score = parseSetScore(s);
              const otherScore = parseSetScore(game.p2Sets[i]);
              const isWinner = parseInt(score.games) > parseInt(otherScore.games);
              return (
                <div key={i} className={`set-box ${isWinner ? 'winner-val' : ''}`}>
                  {score.games}{score.tb && <span className="tiebreak-val">({score.tb})</span>}
                </div>
              );
            })}
            {game.status === 'LIVE' && <div className="game-point-box">{game.currentGame}</div>}
          </div>
        </div>
        <div className="player-row">
          <div className={`player-name ${game.serving === 2 ? 'serving' : ''} ${game.winner === 'Second Player' ? 'winner' : ''}`}>
            <PlayerFlag playerKey={game.p2Key} />
            {game.player2} {game.winner === 'Second Player' && <span style={{ marginLeft: '4px', fontSize: '0.9rem' }}>✅</span>} {rankingMap[game.p2Key] && <span className="player-rank">({rankingMap[game.p2Key]})</span>}
          </div>
          <div className="score-sequence">
            {game.p2Sets.map((s, i) => {
              const score = parseSetScore(s);
              const otherScore = parseSetScore(game.p1Sets[i]);
              const isWinner = parseInt(score.games) > parseInt(otherScore.games);
              return (
                <div key={i} className={`set-box ${isWinner ? 'winner-val' : ''}`}>
                  {score.games}{score.tb && <span className="tiebreak-val">({score.tb})</span>}
                </div>
              );
            })}
            {game.status === 'LIVE' && <div className="game-point-box">{game.p2Game}</div>}
          </div>
        </div>
      </div>
      {/* Odds Column */}
      {(game.p1Odd || game.p2Odd) && (
        <div className="odds-column" style={{ justifyContent: 'center', gap: '8px' }}>
          <div className="odd-value" title="Cuota (bet365/bwin)">{game.p1Odd || '-'}</div>
          <div className="odd-value" title="Cuota (bet365/bwin)">{game.p2Odd || '-'}</div>
        </div>
      )}
    </div>
  );
};

export default MatchRow;
