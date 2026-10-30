import React, { useEffect } from 'react'
import { useTennis } from '../../context/TennisContext'

const PlayerFlag = ({ playerKey }) => {
  const { playerProfiles, fetchPlayerProfile } = useTennis()

  useEffect(() => {
    if (playerKey && (!playerProfiles[playerKey] || !playerProfiles[playerKey].fullProfileFetched)) {
      fetchPlayerProfile(playerKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerKey])

  const profile = playerProfiles[playerKey]
  
  if (!profile || !profile.code) {
    return <span style={{ width: '18px', display: 'inline-block' }}></span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w20/${profile.code.toLowerCase()}.png`}
      alt={profile.country}
      title={profile.country}
      style={{ width: '18px', height: 'auto', marginRight: '8px', verticalAlign: 'middle', borderRadius: '1px' }}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  )
}

export default PlayerFlag
