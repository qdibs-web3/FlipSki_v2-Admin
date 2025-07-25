import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletConnection from './WalletConnection';
import TokenManagement from './TokenManagement';
import VRFSettings from './VRFSettings';
import GameStats from './GameStats';
import EmergencyControls from './EmergencyControls';
import { useFlipSkiContract } from '../hooks/useFlipSkiContract';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  
  const { address, isConnected } = useAccount();
  const contract = useFlipSkiContract();
  
  // Admin addresses - these should match the contract's admin roles
  const adminAddresses = [
    '0xf562BaFabdB96cA6d1FF978A9663903BaCa60b1b',
    '0xf08d3184c50a1B255507785F71c9330034852Cd5'
  ];
  
  const isAdmin = address && adminAddresses.some(adminAddr => 
    adminAddr.toLowerCase() === address.toLowerCase()
  );

  // Contract data hooks
  const { data: activeTokensData, isLoading: tokensLoading, refetch: refetchTokens } = contract.useGetActiveTokens();
  const { data: contractStats, isLoading: statsLoading, refetch: refetchStats } = contract.useGetContractStats();
  const { data: vrfConfig, isLoading: vrfLoading, refetch: refetchVRF, error: vrfError } = contract.useGetVRFConfig();

  // Helper function to safely stringify objects with BigInt
  const safeStringify = (obj) => {
    return JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() + 'n' : value
    );
  };

  // Debug VRF config
  useEffect(() => {
    console.log('VRF Config Debug:', {
      vrfConfig: vrfConfig ? safeStringify(vrfConfig) : 'undefined',
      vrfLoading,
      vrfError: vrfError ? vrfError.message : null,
      isConnected,
      address
    });
  }, [vrfConfig, vrfLoading, vrfError, isConnected, address]);

  // Process tokens data
  const tokens = activeTokensData && activeTokensData[1] ? activeTokensData[1].map((config, index) => ({
    address: activeTokensData[0][index],
    symbol: config.symbol,
    name: config.name,
    decimals: config.decimals,
    minWager: config.minWager,
    maxWager: config.maxWager,
    isActive: config.isActive,
    isPaused: config.isPaused,
    minWagerFormatted: contract.formatTokenAmount(config.minWager, config.decimals),
    maxWagerFormatted: contract.formatTokenAmount(config.maxWager, config.decimals)
  })) : [];

  // Calculate stats
  const contractStatsProcessed = {
    totalTokens: tokens.length,
    activeTokens: tokens.filter(t => t.isActive && !t.isPaused).length,
    pausedTokens: tokens.filter(t => t.isPaused).length
  };

  // Show alert message
  const showAlert = (message, type = 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage('');
      setAlertType('');
    }, 5000);
  };

  // Refresh all data
  const refreshData = () => {
    refetchTokens();
    refetchStats();
    refetchVRF();
  };

  // Handle transaction success
  const handleTransactionSuccess = (message) => {
    showAlert(message, 'success');
    // Refresh data after successful transaction
    setTimeout(refreshData, 2000);
  };

  // Handle transaction error
  const handleTransactionError = (error) => {
    console.error('Transaction error:', error);
    showAlert(`Transaction failed: ${error.message || 'Unknown error'}`, 'error');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tokens', label: 'Token Management', icon: '🪙' },
    { id: 'vrf', label: 'VRF Settings', icon: '🎲' },
    { id: 'stats', label: 'Game Statistics', icon: '📈' },
    { id: 'emergency', label: 'Emergency Controls', icon: '🚨' }
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="header-title">🎮 FlipSki V2 Admin Panel</h1>
        <p className="header-subtitle">By: Qdibs</p>
      </div>

      {/* Wallet Connection */}
      <WalletConnection />

      {/* Alert Messages */}
      {alertMessage && (
        <div className={`alert alert-${alertType}`}>
          <span>{alertMessage}</span>
          <button onClick={() => setAlertMessage('')} className="alert-close">×</button>
        </div>
      )}

      {isConnected && address && (
        <>
          {/* Navigation Tabs */}
          <div className="tab-navigation">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">📊 Contract Overview</h2>
                  <button onClick={refreshData} className="refresh-btn">
                    🔄 Refresh Data
                  </button>
                </div>
                
                <div className="overview-stats">
                  <div className="stat-card">
                    <div className="stat-icon">🪙</div>
                    <div>
                      <div className="stat-value">{contractStatsProcessed.totalTokens}</div>
                      <div className="stat-label">Total Tokens</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div>
                      <div className="stat-value">{contractStatsProcessed.activeTokens}</div>
                      <div className="stat-label">Active Tokens</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⏸️</div>
                    <div>
                      <div className="stat-value">{contractStatsProcessed.pausedTokens}</div>
                      <div className="stat-label">Paused Tokens</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">👤</div>
                    <div>
                      <div className="stat-value">{isAdmin ? 'Admin' : 'User'}</div>
                      <div className="stat-label">Access Level</div>
                    </div>
                  </div>
                </div>

                <div className="quick-actions">
                  <h3 className="section-title">🚀 Quick Actions</h3>
                  <div className="action-buttons">
                    <button 
                      onClick={() => setActiveTab('tokens')}
                      className="action-btn action-btn-primary"
                    >
                      🪙 Manage Tokens
                    </button>
                    <button 
                      onClick={() => setActiveTab('vrf')}
                      className="action-btn action-btn-secondary"
                    >
                      🎲 Configure VRF
                    </button>
                    <button 
                      onClick={() => setActiveTab('stats')}
                      className="action-btn action-btn-info"
                    >
                      📈 View Statistics
                    </button>
                    <button 
                      onClick={refreshData}
                      className="action-btn action-btn-success"
                    >
                      🔄 Refresh Data
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="section-title">🔧 System Status</h3>
                  <div className="status-grid">
                    <div className="status-item">
                      <span className="status-label">Contract:</span>
                      <span className="status-value status-connected">Connected</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Wallet:</span>
                      <span className="status-value status-connected">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Network:</span>
                      <span className="status-value status-connected">Base Mainnet</span>
                    </div>
                    <div className="status-item">
                      <span className="status-label">VRF Status:</span>
                      <span className={`status-value ${vrfConfig ? 'status-connected' : 'status-loading'}`}>
                        {vrfLoading ? 'Loading...' : vrfConfig ? 'Configured' : 'Error'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Token Management Tab */}
            {activeTab === 'tokens' && (
              <TokenManagement
                tokens={tokens}
                isLoading={tokensLoading}
                isAdmin={isAdmin}
                contract={contract}
                onSuccess={handleTransactionSuccess}
                onError={handleTransactionError}
              />
            )}

            {/* VRF Settings Tab */}
            {activeTab === 'vrf' && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">🎲 VRF Settings</h2>
                  <button onClick={refetchVRF} className="refresh-btn">
                    🔄 Refresh VRF Config
                  </button>
                </div>

                {/* VRF Loading State */}
                {vrfLoading && (
                  <div className="loading-state">
                    <p>Loading VRF configuration...</p>
                  </div>
                )}

                {/* VRF Error State */}
                {vrfError && (
                  <div className="error-state">
                    <p>Error loading VRF configuration: {vrfError.message}</p>
                    <button onClick={refetchVRF} className="retry-btn">
                      🔄 Retry
                    </button>
                  </div>
                )}

                {/* VRF Settings Component - This includes the Current Configuration Display */}
                <VRFSettings
                  vrfConfig={vrfConfig}
                  isLoading={vrfLoading}
                  isAdmin={isAdmin}
                  contract={contract}
                  onSuccess={handleTransactionSuccess}
                  onError={handleTransactionError}
                />

                {/* REMOVED: Duplicate Current Configuration Display */}
                {/* The VRFSettings component already includes this section */}

                {/* No VRF Config Message */}
                {!vrfLoading && !vrfError && !vrfConfig && (
                  <div className="info-state">
                    <p>No VRF configuration found. Please check your contract connection.</p>
                  </div>
                )}
              </div>
            )}

            {/* Game Statistics Tab */}
            {activeTab === 'stats' && (
              <GameStats
                stats={contractStats}
                tokens={tokens}
                isLoading={statsLoading}
                onRefresh={refetchStats}
              />
            )}

            {/* Emergency Controls Tab */}
            {activeTab === 'emergency' && (
              <EmergencyControls
                isAdmin={isAdmin}
                contract={contract}
                onSuccess={handleTransactionSuccess}
                onError={handleTransactionError}
              />
            )}
          </div>
        </>
      )}

      {/* Not Connected State */}
      {!isConnected && (
        <div className="not-connected">
          <h3>Please connect your wallet to access the admin panel</h3>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

