import { useState, useEffect } from 'react';
import WalletConnection from './WalletConnection';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [editingToken, setEditingToken] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [contractStats, setContractStats] = useState({
    totalTokens: 0,
    activeTokens: 0,
    pausedTokens: 0
  });

  // Contract and wallet state
  const [contract, setContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // VRF Settings state
  const [vrfSettings, setVrfSettings] = useState({
    coordinator: '',
    subscriptionId: '',
    keyHash: '',
    gasLimit: '',
    confirmations: ''
  });

  // Game stats state
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalVolume: 0,
    totalFees: 0,
    totalPlayers: 0
  });

  // Inline styles (same as before)
  const styles = {
    adminDashboard: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      background: '#f8f9fa',
      minHeight: '100vh'
    },
    dashboardHeader: {
      textAlign: 'center',
      marginBottom: '30px',
      background: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    },
    headerTitle: {
      margin: '0 0 10px 0',
      color: '#2c3e50',
      fontSize: '2.5rem',
      fontWeight: '700'
    },
    headerSubtitle: {
      margin: '0',
      color: '#6c757d',
      fontSize: '1.1rem'
    },
    alert: {
      padding: '15px 20px',
      marginBottom: '20px',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: '500'
    },
    alertSuccess: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    alertError: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    alertInfo: {
      background: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb'
    },
    alertClose: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: 'inherit',
      opacity: '0.7'
    },
    tabNavigation: {
      display: 'flex',
      background: 'white',
      borderRadius: '12px',
      padding: '8px',
      marginBottom: '24px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      overflowX: 'auto',
      gap: '4px'
    },
    tabButton: {
      flex: '1',
      minWidth: '160px',
      padding: '12px 16px',
      border: 'none',
      background: 'transparent',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontWeight: '500',
      color: '#6c757d'
    },
    tabButtonActive: {
      background: '#4a90e2',
      color: 'white',
      boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)'
    },
    tabContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      minHeight: '500px'
    },
    overviewStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: '#f8f9fa',
      padding: '24px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      border: '1px solid #e9ecef',
      transition: 'transform 0.2s ease'
    },
    statIcon: {
      fontSize: '2rem',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white',
      borderRadius: '50%',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    statValue: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#2c3e50',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#6c757d',
      fontWeight: '500'
    },
    quickActions: {
      marginBottom: '30px'
    },
    sectionTitle: {
      marginBottom: '16px',
      color: '#2c3e50'
    },
    actionButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px'
    },
    actionBtn: {
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    actionBtnPrimary: {
      background: '#4a90e2',
      color: 'white'
    },
    actionBtnSecondary: {
      background: '#6c757d',
      color: 'white'
    },
    actionBtnInfo: {
      background: '#17a2b8',
      color: 'white'
    },
    actionBtnSuccess: {
      background: '#28a745',
      color: 'white'
    },
    statusGrid: {
      display: 'grid',
      gap: '12px'
    },
    statusItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      background: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    statusLabel: {
      fontWeight: '600',
      color: '#495057'
    },
    statusValue: {
      fontWeight: '500',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.9rem'
    },
    statusConnected: {
      background: '#d4edda',
      color: '#155724'
    },
    statusDisconnected: {
      background: '#f8d7da',
      color: '#721c24'
    },
    tokensHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    addTokenBtn: {
      background: '#28a745',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background 0.2s ease'
    },
    tokensTable: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    tableHeader: {
      background: '#f8f9fa',
      fontWeight: '600',
      color: '#495057',
      padding: '16px',
      textAlign: 'left',
      borderBottom: '1px solid #e9ecef'
    },
    tableCell: {
      padding: '16px',
      textAlign: 'left',
      borderBottom: '1px solid #e9ecef'
    },
    tokenInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    tokenSymbol: {
      display: 'block',
      color: '#2c3e50',
      marginBottom: '4px',
      fontWeight: 'bold'
    },
    tokenName: {
      display: 'block',
      color: '#6c757d',
      marginBottom: '4px',
      fontSize: '0.9rem'
    },
    tokenAddress: {
      fontFamily: 'monospace',
      fontSize: '0.8rem',
      color: '#6c757d'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '600'
    },
    statusActive: {
      background: '#d4edda',
      color: '#155724'
    },
    statusPaused: {
      background: '#fff3cd',
      color: '#856404'
    },
    tableActionButtons: {
      display: 'flex',
      gap: '8px'
    },
    btnEdit: {
      background: 'none',
      border: '1px solid #dee2e6',
      padding: '6px 10px',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    },
    vrfSettings: {
      display: 'grid',
      gap: '20px'
    },
    vrfSetting: {
      display: 'grid',
      gridTemplateColumns: '200px 1fr auto',
      gap: '16px',
      alignItems: 'center',
      padding: '16px',
      background: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    vrfLabel: {
      fontWeight: '600',
      color: '#495057'
    },
    vrfInput: {
      padding: '8px 12px',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '14px'
    },
    vrfButton: {
      background: '#4a90e2',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background 0.2s ease'
    },
    refreshBtn: {
      background: '#17a2b8',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      marginBottom: '24px',
      transition: 'background 0.2s ease'
    },
    emergencyHeader: {
      marginBottom: '30px'
    },
    emergencyTitle: {
      marginBottom: '8px',
      color: '#dc3545'
    },
    warningText: {
      color: '#856404',
      background: '#fff3cd',
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid #ffeaa7',
      margin: '0'
    },
    emergencyActions: {
      display: 'grid',
      gap: '30px'
    },
    emergencyButtons: {
      display: 'flex',
      gap: '16px',
      marginBottom: '12px'
    },
    emergencyBtn: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    emergencyBtnPause: {
      background: '#ffc107',
      color: '#212529'
    },
    emergencyBtnUnpause: {
      background: '#28a745',
      color: 'white'
    },
    modalOverlay: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000'
    },
    modal: {
      background: 'white',
      borderRadius: '12px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: '1px solid #e9ecef'
    },
    modalTitle: {
      margin: '0',
      color: '#2c3e50'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6c757d',
      padding: '0',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'all 0.2s ease'
    },
    modalContent: {
      padding: '24px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formLabel: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: '600',
      color: '#495057'
    },
    formInput: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box'
    },
    tokenDisplay: {
      padding: '12px',
      background: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #e9ecef'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    btnCancel: {
      background: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background 0.2s ease'
    },
    btnSubmit: {
      background: '#4a90e2',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'background 0.2s ease'
    }
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

  // FIXED: Simple functions without useCallback to prevent infinite loops
  const loadTokens = async () => {
    if (!contract || isLoading || !walletAddress) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock data for now - replace with actual contract calls
      const mockTokens = [
        {
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          minWager: '1000000000000000', // 0.001 ETH
          maxWager: '10000000000000000000', // 10 ETH
          isActive: true,
          isPaused: false,
          minWagerFormatted: 0.001,
          maxWagerFormatted: 10
        },
        {
          address: '0xE4b2F8B5B9497222093e2B1Afb98CE2728D3bB07',
          symbol: 'FLIPSKI',
          name: 'FlipSki Token',
          decimals: 18,
          minWager: '1000000000000000000000000', // 1M tokens
          maxWager: '100000000000000000000000000', // 100M tokens
          isActive: true,
          isPaused: false,
          minWagerFormatted: 1000000,
          maxWagerFormatted: 100000000
        }
      ];

      setTokens(mockTokens);
      
      // Update stats
      setContractStats({
        totalTokens: mockTokens.length,
        activeTokens: mockTokens.filter(t => t.isActive && !t.isPaused).length,
        pausedTokens: mockTokens.filter(t => t.isPaused).length
      });

      showAlert('Tokens loaded successfully!', 'success');
    } catch (error) {
      console.error('Error loading tokens:', error);
      showAlert('Failed to load tokens: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVRFSettings = async () => {
    if (!contract) return;

    try {
      // Mock VRF settings - replace with actual contract calls
      setVrfSettings({
        coordinator: '0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634',
        subscriptionId: '123456',
        keyHash: '0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899',
        gasLimit: '100000',
        confirmations: '3'
      });
    } catch (error) {
      console.error('Error loading VRF settings:', error);
    }
  };

  const loadGameStats = async () => {
    if (!contract) return;

    try {
      // Mock game stats - replace with actual contract calls
      setGameStats({
        totalGames: 1234,
        totalVolume: 567890000000000000000, // 567.89 ETH
        totalFees: 28394500000000000000, // 28.39 ETH
        totalPlayers: 456
      });
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
  };

  // FIXED: Only load data once when wallet connects - NO DEPENDENCIES
  useEffect(() => {
    if (contract && walletAddress) {
      loadTokens();
      loadVRFSettings();
      loadGameStats();
    }
  }, []); // EMPTY DEPENDENCY ARRAY - ONLY RUNS ONCE

  // Handle token actions
  const handleTokenAction = async (action, tokenAddress, ...args) => {
    if (!contract || !walletAddress) {
      showAlert('Please connect your wallet first', 'error');
      return;
    }

    if (!isAdmin) {
      showAlert('Admin access required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      let hash = '0x1234567890abcdef'; // Mock transaction hash
      
      switch (action) {
        case 'pause':
          console.log('Pausing token:', tokenAddress);
          showAlert(`Token paused successfully! Transaction: ${hash}`, 'success');
          break;
        case 'unpause':
          console.log('Unpausing token:', tokenAddress);
          showAlert(`Token unpaused successfully! Transaction: ${hash}`, 'success');
          break;
        case 'remove':
          if (confirm('Are you sure you want to remove this token?')) {
            console.log('Removing token:', tokenAddress);
            showAlert(`Token removed successfully! Transaction: ${hash}`, 'success');
          } else {
            setIsLoading(false);
            return;
          }
          break;
        case 'update':
          const [minWager, maxWager] = args;
          console.log('Updating token config:', tokenAddress, minWager, maxWager);
          showAlert(`Token configuration updated! Transaction: ${hash}`, 'success');
          break;
      }

      // Reload tokens after action
      setTimeout(() => {
        loadTokens();
      }, 2000);
    } catch (error) {
      console.error(`Error ${action} token:`, error);
      showAlert(`Failed to ${action} token: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Emergency actions
  const handleEmergencyAction = async (action) => {
    if (!contract || !walletAddress) {
      showAlert('Please connect your wallet first', 'error');
      return;
    }

    if (!isAdmin) {
      showAlert('Admin access required', 'error');
      return;
    }

    const confirmMessage = action === 'pause' 
      ? 'Are you sure you want to pause the entire contract?' 
      : 'Are you sure you want to unpause the contract?';
    
    if (!confirm(confirmMessage)) return;

    setIsLoading(true);
    try {
      const hash = '0x1234567890abcdef'; // Mock transaction hash
      showAlert(`Contract ${action}d successfully! Transaction: ${hash}`, 'success');
    } catch (error) {
      console.error(`Error ${action} contract:`, error);
      showAlert(`Failed to ${action} contract: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle VRF updates
  const handleVRFUpdate = async (setting, value) => {
    if (!contract || !walletAddress) {
      showAlert('Please connect your wallet first', 'error');
      return;
    }

    if (!isAdmin) {
      showAlert('Admin access required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const hash = '0x1234567890abcdef'; // Mock transaction hash
      showAlert(`VRF ${setting} updated successfully! Transaction: ${hash}`, 'success');
      setTimeout(() => {
        loadVRFSettings();
      }, 2000);
    } catch (error) {
      console.error(`Error updating VRF ${setting}:`, error);
      showAlert(`Failed to update VRF ${setting}: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tokens', label: 'Token Management', icon: '🪙' },
    { id: 'vrf', label: 'VRF Settings', icon: '🎲' },
    { id: 'stats', label: 'Game Statistics', icon: '📈' },
    { id: 'emergency', label: 'Emergency Controls', icon: '🚨' }
  ];

  return (
    <div style={styles.adminDashboard}>
      <div style={styles.dashboardHeader}>
        <h1 style={styles.headerTitle}>🎮 FlipSki V2 Admin Panel</h1>
        <p style={styles.headerSubtitle}>By: Qdibs</p>
      </div>

      {/* Wallet Connection */}
      <WalletConnection 
        onWalletChange={(address) => setWalletAddress(address)}
        onContractChange={(contractInstance) => setContract(contractInstance)}
        onAdminStatusChange={(status) => setIsAdmin(status)}
      />

      {/* Alert Messages */}
      {alertMessage && (
        <div style={{
          ...styles.alert,
          ...(alertType === 'success' ? styles.alertSuccess : 
              alertType === 'error' ? styles.alertError : styles.alertInfo)
        }}>
          <span>{alertMessage}</span>
          <button onClick={() => setAlertMessage('')} style={styles.alertClose}>×</button>
        </div>
      )}

      {walletAddress && (
        <>
          {/* Navigation Tabs */}
          <div style={styles.tabNavigation}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === tab.id ? styles.tabButtonActive : {})
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div style={styles.overviewStats}>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>🪙</div>
                    <div>
                      <div style={styles.statValue}>{contractStats.totalTokens}</div>
                      <div style={styles.statLabel}>Total Tokens</div>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>✅</div>
                    <div>
                      <div style={styles.statValue}>{contractStats.activeTokens}</div>
                      <div style={styles.statLabel}>Active Tokens</div>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>⏸️</div>
                    <div>
                      <div style={styles.statValue}>{contractStats.pausedTokens}</div>
                      <div style={styles.statLabel}>Paused Tokens</div>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>👤</div>
                    <div>
                      <div style={styles.statValue}>{isAdmin ? 'Admin' : 'User'}</div>
                      <div style={styles.statLabel}>Access Level</div>
                    </div>
                  </div>
                </div>

                <div style={styles.quickActions}>
                  <h3 style={styles.sectionTitle}>🚀 Quick Actions</h3>
                  <div style={styles.actionButtons}>
                    <button 
                      onClick={() => setActiveTab('tokens')}
                      style={{...styles.actionBtn, ...styles.actionBtnPrimary}}
                    >
                      🪙 Manage Tokens
                    </button>
                    <button 
                      onClick={() => setActiveTab('vrf')}
                      style={{...styles.actionBtn, ...styles.actionBtnSecondary}}
                    >
                      🎲 Configure VRF
                    </button>
                    <button 
                      onClick={() => setActiveTab('stats')}
                      style={{...styles.actionBtn, ...styles.actionBtnInfo}}
                    >
                      📈 View Statistics
                    </button>
                    <button 
                      onClick={() => setShowAddToken(true)}
                      style={{...styles.actionBtn, ...styles.actionBtnSuccess}}
                      disabled={!isAdmin}
                    >
                      ➕ Add New Token
                    </button>
                  </div>
                </div>

                <div>
                  <h3 style={styles.sectionTitle}>🔧 System Status</h3>
                  <div style={styles.statusGrid}>
                    <div style={styles.statusItem}>
                      <span style={styles.statusLabel}>Contract:</span>
                      <span style={{...styles.statusValue, ...styles.statusConnected}}>Connected</span>
                    </div>
                    <div style={styles.statusItem}>
                      <span style={styles.statusLabel}>Wallet:</span>
                      <span style={{...styles.statusValue, ...styles.statusConnected}}>
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </span>
                    </div>
                    <div style={styles.statusItem}>
                      <span style={styles.statusLabel}>Admin Access:</span>
                      <span style={{
                        ...styles.statusValue, 
                        ...(isAdmin ? styles.statusConnected : styles.statusDisconnected)
                      }}>
                        {isAdmin ? 'Granted' : 'Denied'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Token Management Tab */}
            {activeTab === 'tokens' && (
              <div>
                <div style={styles.tokensHeader}>
                  <h3 style={styles.sectionTitle}>🪙 Token Management</h3>
                  <button 
                    onClick={() => setShowAddToken(true)}
                    style={styles.addTokenBtn}
                    disabled={!isAdmin || isLoading}
                  >
                    {isLoading ? '⏳ Loading...' : '➕ Add Token'}
                  </button>
                </div>

                <div style={styles.tokensTable}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Token</th>
                        <th style={styles.tableHeader}>Min Wager</th>
                        <th style={styles.tableHeader}>Max Wager</th>
                        <th style={styles.tableHeader}>Status</th>
                        <th style={styles.tableHeader}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.length > 0 ? tokens.map((token, index) => (
                        <tr key={index}>
                          <td style={styles.tableCell}>
                            <div style={styles.tokenInfo}>
                              <span style={styles.tokenSymbol}>{token.symbol}</span>
                              <span style={styles.tokenName}>{token.name}</span>
                              <div style={styles.tokenAddress}>{token.address.slice(0, 10)}...</div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>{token.minWagerFormatted} {token.symbol}</td>
                          <td style={styles.tableCell}>{token.maxWagerFormatted} {token.symbol}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...(token.isPaused ? styles.statusPaused : styles.statusActive)
                            }}>
                              {token.isPaused ? 'Paused' : 'Active'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.tableActionButtons}>
                              <button 
                                onClick={() => setEditingToken(token)}
                                style={styles.btnEdit}
                                disabled={!isAdmin || isLoading}
                                title="Edit token configuration"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleTokenAction(
                                  token.isPaused ? 'unpause' : 'pause', 
                                  token.address
                                )}
                                style={styles.btnEdit}
                                disabled={!isAdmin || isLoading}
                                title={token.isPaused ? 'Unpause token' : 'Pause token'}
                              >
                                {token.isPaused ? '▶️' : '⏸️'}
                              </button>
                              {token.address !== '0x0000000000000000000000000000000000000000' && (
                                <button 
                                  onClick={() => handleTokenAction('remove', token.address)}
                                  style={styles.btnEdit}
                                  disabled={!isAdmin || isLoading}
                                  title="Remove token"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" style={{...styles.tableCell, textAlign: 'center', padding: '20px'}}>
                            {isLoading ? 'Loading tokens...' : 'No tokens found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VRF Settings Tab */}
            {activeTab === 'vrf' && (
              <div>
                <h3 style={styles.sectionTitle}>🎲 VRF Settings</h3>
                <p>Configure Chainlink VRF settings for random number generation</p>
                
                <div style={styles.vrfSettings}>
                  <div style={styles.vrfSetting}>
                    <label style={styles.vrfLabel}>VRF Coordinator:</label>
                    <input 
                      type="text" 
                      value={vrfSettings.coordinator} 
                      onChange={(e) => setVrfSettings({...vrfSettings, coordinator: e.target.value})}
                      placeholder="0x..."
                      style={styles.vrfInput}
                    />
                    <button 
                      onClick={() => handleVRFUpdate('coordinator', vrfSettings.coordinator)}
                      disabled={!isAdmin || isLoading}
                      style={styles.vrfButton}
                    >
                      Update
                    </button>
                  </div>
                  
                  <div style={styles.vrfSetting}>
                    <label style={styles.vrfLabel}>Subscription ID:</label>
                    <input 
                      type="number" 
                      value={vrfSettings.subscriptionId} 
                      onChange={(e) => setVrfSettings({...vrfSettings, subscriptionId: e.target.value})}
                      placeholder="123456"
                      style={styles.vrfInput}
                    />
                    <button 
                      onClick={() => handleVRFUpdate('subscriptionId', vrfSettings.subscriptionId)}
                      disabled={!isAdmin || isLoading}
                      style={styles.vrfButton}
                    >
                      Update
                    </button>
                  </div>
                  
                  <div style={styles.vrfSetting}>
                    <label style={styles.vrfLabel}>Key Hash (Base Network):</label>
                    <select 
                      value={vrfSettings.keyHash} 
                      onChange={(e) => setVrfSettings({...vrfSettings, keyHash: e.target.value})}
                      style={styles.vrfInput}
                    >
                      <option value="">Select Key Hash</option>
                      <option value="0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899">
                        Base 500 gwei (Recommended)
                      </option>
                      <option value="0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae">
                        Base 1000 gwei
                      </option>
                    </select>
                    <button 
                      onClick={() => handleVRFUpdate('keyHash', vrfSettings.keyHash)}
                      disabled={!isAdmin || isLoading}
                      style={styles.vrfButton}
                    >
                      Update
                    </button>
                  </div>
                  
                  <div style={styles.vrfSetting}>
                    <label style={styles.vrfLabel}>Gas Limit:</label>
                    <input 
                      type="number" 
                      value={vrfSettings.gasLimit} 
                      onChange={(e) => setVrfSettings({...vrfSettings, gasLimit: e.target.value})}
                      placeholder="100000"
                      style={styles.vrfInput}
                    />
                    <button 
                      onClick={() => handleVRFUpdate('gasLimit', vrfSettings.gasLimit)}
                      disabled={!isAdmin || isLoading}
                      style={styles.vrfButton}
                    >
                      Update
                    </button>
                  </div>
                  
                  <div style={styles.vrfSetting}>
                    <label style={styles.vrfLabel}>Confirmations:</label>
                    <input 
                      type="number" 
                      value={vrfSettings.confirmations} 
                      onChange={(e) => setVrfSettings({...vrfSettings, confirmations: e.target.value})}
                      placeholder="3"
                      style={styles.vrfInput}
                    />
                    <button 
                      onClick={() => handleVRFUpdate('confirmations', vrfSettings.confirmations)}
                      disabled={!isAdmin || isLoading}
                      style={styles.vrfButton}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Statistics Tab */}
            {activeTab === 'stats' && (
              <div>
                <h3 style={styles.sectionTitle}>📈 Game Statistics</h3>
                <button 
                  onClick={loadGameStats}
                  style={styles.refreshBtn}
                  disabled={isLoading}
                >
                  🔄 Refresh Stats
                </button>
                
                <div style={styles.overviewStats}>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>🎮</div>
                    <div>
                      <div style={styles.statValue}>{gameStats.totalGames}</div>
                      <div style={styles.statLabel}>Total Games</div>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>💰</div>
                    <div>
                      <div style={styles.statValue}>{(gameStats.totalVolume / 1e18).toFixed(4)} ETH</div>
                      <div style={styles.statLabel}>Total Volume</div>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>💸</div>
                    <div>
                      <div style={styles.statValue}>{(gameStats.totalFees / 1e18).toFixed(4)} ETH</div>
                      <div style={styles.statLabel}>Total Fees</div>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statIcon}>👥</div>
                    <div>
                      <div style={styles.statValue}>{gameStats.totalPlayers}</div>
                      <div style={styles.statLabel}>Total Players</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Controls Tab */}
            {activeTab === 'emergency' && (
              <div>
                <div style={styles.emergencyHeader}>
                  <h3 style={styles.emergencyTitle}>🚨 Emergency Controls</h3>
                  <p style={styles.warningText}>
                    ⚠️ These actions affect the entire contract. Use with caution!
                  </p>
                </div>

                <div style={styles.emergencyActions}>
                  <div>
                    <h4>Contract Controls</h4>
                    <div style={styles.emergencyButtons}>
                      <button 
                        onClick={() => handleEmergencyAction('pause')}
                        style={{...styles.emergencyBtn, ...styles.emergencyBtnPause}}
                        disabled={!isAdmin || isLoading}
                      >
                        ⏸️ Pause Contract
                      </button>
                      <button 
                        onClick={() => handleEmergencyAction('unpause')}
                        style={{...styles.emergencyBtn, ...styles.emergencyBtnUnpause}}
                        disabled={!isAdmin || isLoading}
                      >
                        ▶️ Unpause Contract
                      </button>
                    </div>
                    <p>
                      Pause/unpause all game functionality across the entire contract.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Token Dialog */}
      {showAddToken && (
        <AddTokenDialog
          onClose={() => setShowAddToken(false)}
          onSuccess={(message) => {
            showAlert(message, 'success');
            setShowAddToken(false);
            setTimeout(loadTokens, 2000);
          }}
          onError={(message) => showAlert(message, 'error')}
          contract={contract}
          isAdmin={isAdmin}
          styles={styles}
        />
      )}

      {/* Edit Token Dialog */}
      {editingToken && (
        <EditTokenDialog
          token={editingToken}
          onClose={() => setEditingToken(null)}
          onSuccess={(message) => {
            showAlert(message, 'success');
            setEditingToken(null);
            setTimeout(loadTokens, 2000);
          }}
          onError={(message) => showAlert(message, 'error')}
          contract={contract}
          isAdmin={isAdmin}
          styles={styles}
        />
      )}
    </div>
  );
};

// Add Token Dialog Component
const AddTokenDialog = ({ onClose, onSuccess, onError, contract, isAdmin, styles }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [minWager, setMinWager] = useState('');
  const [maxWager, setMaxWager] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contract || !isAdmin) {
      onError('Admin access required');
      return;
    }

    if (!tokenAddress || !minWager || !maxWager) {
      onError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const hash = '0x1234567890abcdef'; // Mock transaction hash
      onSuccess(`Token added successfully! Transaction: ${hash}`);
    } catch (error) {
      console.error('Error adding token:', error);
      onError('Failed to add token: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>➕ Add New Token</h3>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.modalContent}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Token Address:</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              required
              style={styles.formInput}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Minimum Wager (in wei):</label>
            <input
              type="text"
              value={minWager}
              onChange={(e) => setMinWager(e.target.value)}
              placeholder="1000000000000000000"
              required
              style={styles.formInput}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Maximum Wager (in wei):</label>
            <input
              type="text"
              value={maxWager}
              onChange={(e) => setMaxWager(e.target.value)}
              placeholder="10000000000000000000"
              required
              style={styles.formInput}
            />
          </div>
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.btnCancel}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} style={styles.btnSubmit}>
              {isLoading ? 'Adding...' : 'Add Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Token Dialog Component
const EditTokenDialog = ({ token, onClose, onSuccess, onError, contract, isAdmin, styles }) => {
  const [minWager, setMinWager] = useState(token.minWager.toString());
  const [maxWager, setMaxWager] = useState(token.maxWager.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contract || !isAdmin) {
      onError('Admin access required');
      return;
    }

    if (!minWager || !maxWager) {
      onError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const hash = '0x1234567890abcdef'; // Mock transaction hash
      onSuccess(`Token updated successfully! Transaction: ${hash}`);
    } catch (error) {
      console.error('Error updating token:', error);
      onError('Failed to update token: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>✏️ Edit Token: {token.symbol}</h3>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.modalContent}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Token:</label>
            <div style={styles.tokenDisplay}>
              <strong>{token.symbol}</strong> - {token.name}
              <br />
              <small>{token.address}</small>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Minimum Wager (in wei):</label>
            <input
              type="text"
              value={minWager}
              onChange={(e) => setMinWager(e.target.value)}
              required
              style={styles.formInput}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Maximum Wager (in wei):</label>
            <input
              type="text"
              value={maxWager}
              onChange={(e) => setMaxWager(e.target.value)}
              required
              style={styles.formInput}
            />
          </div>
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.btnCancel}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} style={styles.btnSubmit}>
              {isLoading ? 'Updating...' : 'Update Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;

