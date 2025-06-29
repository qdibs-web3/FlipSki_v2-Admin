import { useState } from 'react';

const VRFSettingsPanel = ({ 
  contract, 
  walletAddress, 
  isAdmin, 
  onSuccess, 
  onError 
}) => {
  const [vrfConfig, setVrfConfig] = useState({
    coordinator: '',
    subscriptionId: '',
    keyHash: '',
    gasLimit: '100000',
    confirmations: '3'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load current VRF configuration
  const loadVRFConfig = async () => {
    try {
      const config = await contract.read.getVRFConfig();
      setVrfConfig({
        coordinator: config[0],
        subscriptionId: config[1].toString(),
        keyHash: config[2],
        gasLimit: config[3].toString(),
        confirmations: config[4].toString()
      });
    } catch (error) {
      console.error('Error loading VRF config:', error);
      onError('Failed to load VRF configuration');
    }
  };

  // Update individual VRF settings
  const updateVRFSetting = async (setting, value) => {
    if (!contract || !walletAddress) return;

    setIsLoading(true);
    try {
      let hash;
      
      switch (setting) {
        case 'coordinator':
          hash = await contract.write.updateVRFCoordinator([value]);
          break;
        case 'subscriptionId':
          hash = await contract.write.updateVRFSubscriptionId([BigInt(value)]);
          break;
        case 'keyHash':
          hash = await contract.write.updateVRFKeyHash([value]);
          break;
        case 'gasLimit':
          hash = await contract.write.updateVRFGasLimit([parseInt(value)]);
          break;
        case 'confirmations':
          hash = await contract.write.updateVRFConfirmations([parseInt(value)]);
          break;
      }

      onSuccess(`VRF ${setting} updated successfully! Transaction: ${hash}`);
      await loadVRFConfig(); // Reload config
    } catch (error) {
      console.error(`Error updating VRF ${setting}:`, error);
      onError(`Failed to update VRF ${setting}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update all VRF settings at once
  const updateAllVRFSettings = async () => {
    if (!contract || !walletAddress) return;

    setIsLoading(true);
    try {
      const hash = await contract.write.updateVRFConfig([
        vrfConfig.coordinator,
        BigInt(vrfConfig.subscriptionId),
        vrfConfig.keyHash,
        parseInt(vrfConfig.gasLimit),
        parseInt(vrfConfig.confirmations)
      ]);

      onSuccess(`All VRF settings updated successfully! Transaction: ${hash}`);
      await loadVRFConfig();
    } catch (error) {
      console.error('Error updating VRF config:', error);
      onError(`Failed to update VRF configuration: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load config on component mount
  React.useEffect(() => {
    if (contract && isAdmin) {
      loadVRFConfig();
    }
  }, [contract, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="vrf-settings-panel">
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>You need VRF Manager role to access VRF settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vrf-settings-panel">
      <div className="panel-header">
        <h3>🎲 VRF Settings Management</h3>
        <p>Configure Chainlink VRF settings for random number generation</p>
      </div>

      <div className="vrf-config-section">
        <h4>Current VRF Configuration</h4>
        
        {/* VRF Coordinator */}
        <div className="config-item">
          <label>VRF Coordinator Address</label>
          <div className="input-group">
            <input
              type="text"
              value={vrfConfig.coordinator}
              onChange={(e) => setVrfConfig({...vrfConfig, coordinator: e.target.value})}
              placeholder="0x..."
              className="address-input"
            />
            <button 
              onClick={() => updateVRFSetting('coordinator', vrfConfig.coordinator)}
              disabled={isLoading || !vrfConfig.coordinator}
              className="update-btn"
            >
              Update
            </button>
          </div>
          <small>Base Mainnet: 0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634</small>
        </div>

        {/* Subscription ID */}
        <div className="config-item">
          <label>VRF Subscription ID</label>
          <div className="input-group">
            <input
              type="number"
              value={vrfConfig.subscriptionId}
              onChange={(e) => setVrfConfig({...vrfConfig, subscriptionId: e.target.value})}
              placeholder="Enter subscription ID"
              className="number-input"
            />
            <button 
              onClick={() => updateVRFSetting('subscriptionId', vrfConfig.subscriptionId)}
              disabled={isLoading || !vrfConfig.subscriptionId}
              className="update-btn"
            >
              Update
            </button>
          </div>
          <small>Your Chainlink VRF subscription ID (must be funded with LINK)</small>
        </div>

        {/* Key Hash */}
        <div className="config-item">
          <label>VRF Key Hash (Gas Lane)</label>
          <div className="input-group">
            <select
              value={vrfConfig.keyHash}
              onChange={(e) => setVrfConfig({...vrfConfig, keyHash: e.target.value})}
              className="select-input"
            >
              <option value="">Select Key Hash</option>
              <option value="0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899">
                Base 500 gwei (Recommended)
              </option>
              <option value="0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae">
                Base 1000 gwei (Faster)
              </option>
            </select>
            <button 
              onClick={() => updateVRFSetting('keyHash', vrfConfig.keyHash)}
              disabled={isLoading || !vrfConfig.keyHash}
              className="update-btn"
            >
              Update
            </button>
          </div>
          <small>⚠️ CRITICAL: Must use Base network key hash, not Ethereum!</small>
        </div>

        {/* Advanced Settings */}
        <div className="advanced-section">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="toggle-advanced"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Settings
          </button>

          {showAdvanced && (
            <div className="advanced-settings">
              {/* Gas Limit */}
              <div className="config-item">
                <label>Callback Gas Limit</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={vrfConfig.gasLimit}
                    onChange={(e) => setVrfConfig({...vrfConfig, gasLimit: e.target.value})}
                    min="50000"
                    max="2500000"
                    className="number-input"
                  />
                  <button 
                    onClick={() => updateVRFSetting('gasLimit', vrfConfig.gasLimit)}
                    disabled={isLoading}
                    className="update-btn"
                  >
                    Update
                  </button>
                </div>
                <small>Gas limit for VRF callback (50,000 - 2,500,000)</small>
              </div>

              {/* Confirmations */}
              <div className="config-item">
                <label>Request Confirmations</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={vrfConfig.confirmations}
                    onChange={(e) => setVrfConfig({...vrfConfig, confirmations: e.target.value})}
                    min="1"
                    max="200"
                    className="number-input"
                  />
                  <button 
                    onClick={() => updateVRFSetting('confirmations', vrfConfig.confirmations)}
                    disabled={isLoading}
                    className="update-btn"
                  >
                    Update
                  </button>
                </div>
                <small>Block confirmations before VRF fulfillment (1-200)</small>
              </div>
            </div>
          )}
        </div>

        {/* Update All Button */}
        <div className="bulk-update-section">
          <button 
            onClick={updateAllVRFSettings}
            disabled={isLoading}
            className="bulk-update-btn"
          >
            {isLoading ? 'Updating...' : 'Update All VRF Settings'}
          </button>
          <small>Update all VRF settings in a single transaction</small>
        </div>

        {/* Quick Setup Presets */}
        <div className="preset-section">
          <h4>Quick Setup Presets</h4>
          <div className="preset-buttons">
            <button 
              onClick={() => setVrfConfig({
                ...vrfConfig,
                coordinator: '0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634',
                keyHash: '0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899',
                gasLimit: '100000',
                confirmations: '3'
              })}
              className="preset-btn"
            >
              Base Mainnet (Recommended)
            </button>
            <button 
              onClick={() => setVrfConfig({
                ...vrfConfig,
                coordinator: '0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634',
                keyHash: '0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae',
                gasLimit: '150000',
                confirmations: '1'
              })}
              className="preset-btn"
            >
              Base Mainnet (Fast)
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="status-section">
          <h4>VRF Status</h4>
          <div className="status-indicators">
            <div className={`status-item ${vrfConfig.coordinator ? 'valid' : 'invalid'}`}>
              <span className="status-dot"></span>
              Coordinator: {vrfConfig.coordinator ? 'Set' : 'Not Set'}
            </div>
            <div className={`status-item ${vrfConfig.subscriptionId ? 'valid' : 'invalid'}`}>
              <span className="status-dot"></span>
              Subscription: {vrfConfig.subscriptionId ? 'Set' : 'Not Set'}
            </div>
            <div className={`status-item ${vrfConfig.keyHash ? 'valid' : 'invalid'}`}>
              <span className="status-dot"></span>
              Key Hash: {vrfConfig.keyHash ? 'Set' : 'Not Set'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VRFSettingsPanel;

