const GameStats = ({ contractStats, tokens, isLoading, contract, onRefresh }) => {
  
  const formatEthValue = (value) => {
    if (!value) return '0';
    try {
      return contract.formatTokenAmount(value.toString());
    } catch (error) {
      return '0';
    }
  };

  return (
    <div>
      <h3 className="section-title">📈 Game Statistics</h3>
      <button 
        onClick={onRefresh}
        className="refresh-btn"
        disabled={isLoading}
      >
        🔄 {isLoading ? 'Loading...' : 'Refresh Stats'}
      </button>
      
      {contractStats ? (
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-icon">🎮</div>
            <div>
              <div className="stat-value">{contractStats.totalGamesPlayed?.toString() || '0'}</div>
              <div className="stat-label">Total Games</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <div className="stat-value">{formatEthValue(contractStats.totalVolumeETH)} ETH</div>
              <div className="stat-label">Total Volume</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💸</div>
            <div>
              <div className="stat-value">{formatEthValue(contractStats.totalFeesCollected)} ETH</div>
              <div className="stat-label">Total Fees</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <div className="stat-value">{contractStats.totalPlayersServed?.toString() || '0'}</div>
              <div className="stat-label">Total Players</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          {isLoading ? (
            <p>Loading game statistics...</p>
          ) : (
            <p>No statistics available. Please refresh to load data.</p>
          )}
        </div>
      )}

      {/* Token-specific stats */}
      {tokens && tokens.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h4>Token Statistics</h4>
          <div className="tokens-table">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Token</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Min Wager</th>
                  <th className="table-header">Max Wager</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token, index) => (
                  <tr key={index}>
                    <td className="table-cell">
                      <div className="token-info">
                        <span className="token-symbol">{token.symbol}</span>
                        <span className="token-name">{token.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${token.isPaused ? 'status-paused' : 'status-active'}`}>
                        {token.isPaused ? 'Paused' : 'Active'}
                      </span>
                    </td>
                    <td className="table-cell">{token.minWagerFormatted} {token.symbol}</td>
                    <td className="table-cell">{token.maxWagerFormatted} {token.symbol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStats;

