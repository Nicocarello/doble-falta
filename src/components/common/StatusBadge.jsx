import React from 'react'

const StatusBadge = ({ status, time }) => {
  const label = status === 'LIVE' ? 'VIVO' :
    status === 'SUSP' ? 'SUSP' :
      status === 'FIN' ? 'FIN' :
        status === 'RET' ? 'RET' :
          status === 'W/O' ? 'W/O' :
            status === 'REPROG' ? 'POSTP' :
              status;

  const showTime = status !== 'LIVE' && status !== 'SUSP' && status !== 'FIN';

  return (
    <div className={`match-status ${status.toLowerCase()}`}>
      {label}
      {showTime && time && <div style={{ fontSize: '0.6rem', color: '#ccc' }}>{time}</div>}
    </div>
  );
};

export default StatusBadge
