import React from 'react';
import './SkeletonLoader.css';

export const SkeletonMatchRow = () => (
  <div className="skeleton-match-row">
    <div className="skeleton-base skeleton-status"></div>
    <div className="skeleton-players">
      <div className="skeleton-base skeleton-player-name"></div>
      <div className="skeleton-base skeleton-player-name"></div>
    </div>
    <div className="skeleton-scores">
      <div className="skeleton-base skeleton-score-box"></div>
      <div className="skeleton-base skeleton-score-box"></div>
    </div>
  </div>
);

export const SkeletonLeagueBlock = () => (
  <div className="skeleton-league-block">
    <div className="skeleton-base skeleton-league-title"></div>
    <div className="skeleton-games-list">
      <SkeletonMatchRow />
      <SkeletonMatchRow />
      <SkeletonMatchRow />
    </div>
  </div>
);

export const SkeletonRankingRow = () => (
  <div className="skeleton-ranking-row">
    <div className="skeleton-base skeleton-rank"></div>
    <div className="skeleton-base skeleton-ranking-player"></div>
    <div className="skeleton-base skeleton-ranking-points"></div>
  </div>
);
