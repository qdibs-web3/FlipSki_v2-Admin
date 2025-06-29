import { useState, useEffect } from 'react';

const GameStatsPanel = ({ contract, isAdmin }) => {
  const [stats, setStats] = useState({
    totalGamesPlayed: 0,
    totalVolumeETH: 0,
    totalFeesCollected: 0,
    totalPlayersServed: 0
  });
  const [tokenStats, setTokenStats] = useState([]);
  const [contractBalances, setContractBalances] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load contract statistics
  const loadStats = async () => {
    if (!contract) return;

    setIsLoading(true);
    try {
      // Get overall stats
      const contractStats = await contract.read.getContractStats();
      setStats({
        totalGamesPlayed: Number(contractStats[0]),
        totalVolumeETH: Number(contractStats[1]) / 1e18,
        totalFeesCollected: Number(contractStats[2]) / 1e18,
        totalPlayersServed: Number(contractStats[3])
      });

      // Get active tokens and their stats
      const [tokenAddresses, tokenConfigs] = await contract.read.getActiveTokens();
      const tokenStatsData = [];
      const balancesData = [];

      for (let i = 0; i < tokenAddresses.length; i++) {
        const tokenAddress = tokenAddresses[i];
        const config = tokenConfigs[i];
        
        // Get token-specific stats
        const tokenStat = await contract.read.getTokenStats([tokenAddress]);
        const balance = await contract.read.getContractBalance([tokenAddress]);
        
        tokenStatsData.push({
          address: tokenAddress,
          symbol: config.symbol,
          name: config.name,
          volume: Number(tokenStat[0]) / Math.pow(10, config.decimals),
          gamesCount: Number(tokenStat[1]),
          isActive: config.isActive,
          isPaused: config.isPaused
        });

        balancesData.push({
          address: tokenAddress,
          symbol: config.symbol,
          balance: Number(balance) / Math.pow(10, config.decimals),
          decimals: config.decimals
        });
      }

      setTokenStats(tokenStatsData);
      setContractBalances(balancesData);

      // Get recent games (last 10)
      const gameCounter = await contract.read.gameIdCounter();
      const recentGamesData = [];
      const startId = Math.max(1, Number(gameCounter) - 9);
      
      for (let i = Number(gameCounter); i >= startId && i > 0; i--) {
        try {
          const game = await contract.read.getGame([i]);
          if (game.requested) {
            recentGamesData.push({
              id: i,
              player: game.player,
              tokenAddress: game.tokenAddress,
              wagerAmount: Number(game.wagerAmount),
              choice: game.choice,
              result: game.result,
              settled: game.settled,
              timestamp: Number(game.requestTimestamp)
            });
          }
        } catch (error) {
          // Skip invalid games
          continue;
        }
      }
      setRecentGames(recentGamesData);

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh stats
  const startAutoRefresh = () => {
    if (refreshInterval) clearInterval(refreshInterval);
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  // Format numbers for display
  const formatNumber = (num, decimals = 2) => {
    if (num >= 1000000) return (num / 1000000).toFixed(decimals) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(decimals) + 'K';
    return num.toFixed(decimals);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Load stats on component mount
  useEffect(() => {
    if (contract && isAdmin) {
      loadStats();
      startAutoRefresh();
    }
    
    return () => stopAutoRefresh();
  }, [contract, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="stats-panel">
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>Admin access required to view detailed statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h3>📊 Game Statistics & Analytics</h3>
        <div className="header-controls">
          <button onClick={loadStats} disabled={isLoading} className="refresh-btn">
            {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
          <button 
            onClick={refreshInterval ? stopAutoRefresh : startAutoRefresh}
            className={`auto-refresh-btn ${refreshInterval ? 'active' : ''}`}
          >
            {refreshInterval ? '⏸️ Stop Auto' : '▶️ Auto Refresh'}
          </button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="stats-overview">
        <h4>📈 Overall Performance</h4>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalGamesPlayed.toLocaleString()}</div>
            <div className="stat-label">Total Games</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatNumber(stats.totalVolumeETH)} ETH</div>
            <div className="stat-label">Total Volume</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatNumber(stats.totalFeesCollected)} ETH</div>
            <div className="stat-label">Fees Collected</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalPlayersServed.toLocaleString()}</div>
            <div className="stat-label">Unique Players</div>
          </div>
        </div>
      </div>

      {/* Token Statistics */}
      <div className="token-stats-section">
        <h4>🪙 Token Performance</h4>
        <div className="token-stats-table">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Games</th>
                <th>Volume</th>
                <th>Avg Wager</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tokenStats.map((token, index) => (
                <tr key={index}>
                  <td>
                    <div className="token-info">
                      <strong>{token.symbol}</strong>
                      <small>{formatAddress(token.address)}</small>
                    </div>
                  </td>
                  <td>{token.gamesCount.toLocaleString()}</td>
                  <td>{formatNumber(token.volume)} {token.symbol}</td>
                  <td>
                    {token.gamesCount > 0 
                      ? formatNumber(token.volume / token.gamesCount) 
                      : '0'} {token.symbol}
                  </td>
                  <td>
                    <span className={`status-badge ${token.isPaused ? 'paused' : 'active'}`}>
                      {token.isPaused ? 'Paused' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Balances */}
      <div className="balances-section">
        <h4>💰 Contract Balances</h4>
        <div className="balances-grid">
          {contractBalances.map((balance, index) => (
            <div key={index} className="balance-card">
              <div className="balance-header">
                <strong>{balance.symbol}</strong>
                <span className={`balance-status ${balance.balance > 0 ? 'funded' : 'empty'}`}>
                  {balance.balance > 0 ? '✅' : '⚠️'}
                </span>
              </div>
              <div className="balance-amount">
                {formatNumber(balance.balance)} {balance.symbol}
              </div>
              <div className="balance-address">
                {formatAddress(balance.address)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Games */}
      <div className="recent-games-section">
        <h4>🎲 Recent Games</h4>
        <div className="recent-games-table">
          <table>
            <thead>
              <tr>
                <th>Game ID</th>
                <th>Player</th>
                <th>Token</th>
                <th>Wager</th>
                <th>Choice</th>
                <th>Result</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentGames.map((game, index) => {
                const tokenInfo = tokenStats.find(t => t.address === game.tokenAddress);
                const wagerFormatted = tokenInfo 
                  ? (game.wagerAmount / Math.pow(10, tokenInfo.decimals || 18)).toFixed(4)
                  : game.wagerAmount;
                
                return (
                  <tr key={index}>
                    <td>#{game.id}</td>
                    <td>{formatAddress(game.player)}</td>
                    <td>{tokenInfo?.symbol || 'Unknown'}</td>
                    <td>{wagerFormatted}</td>
                    <td>{game.choice === 0 ? 'Heads' : 'Tails'}</td>
                    <td>
                      {game.settled 
                        ? (game.result === 0 ? 'Heads' : 'Tails')
                        : 'Pending'
                      }
                    </td>
                    <td>
                      <span className={`game-status ${game.settled ? 'settled' : 'pending'}`}>
                        {game.settled ? 'Settled' : 'Pending'}
                      </span>
                    </td>
                    <td>{formatTimestamp(game.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-section">
        <h4>⚡ Performance Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Average Game Value</div>
            <div className="metric-value">
              {stats.totalGamesPlayed > 0 
                ? formatNumber(stats.totalVolumeETH / stats.totalGamesPlayed, 4) + ' ETH'
                : '0 ETH'
              }
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Revenue Rate</div>
            <div className="metric-value">
              {stats.totalVolumeETH > 0 
                ? ((stats.totalFeesCollected / stats.totalVolumeETH) * 100).toFixed(2) + '%'
                : '0%'
              }
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Games per Player</div>
            <div className="metric-value">
              {stats.totalPlayersServed > 0 
                ? (stats.totalGamesPlayed / stats.totalPlayersServed).toFixed(1)
                : '0'
              }
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Active Tokens</div>
            <div className="metric-value">
              {tokenStats.filter(t => t.isActive && !t.isPaused).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatsPanel;

