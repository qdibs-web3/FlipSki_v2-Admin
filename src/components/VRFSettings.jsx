import { useState, useEffect } from 'react';

const VRFSettings = ({ vrfConfig, isLoading, isAdmin, contract, onSuccess, onError }) => {
  const [settings, setSettings] = useState({
    coordinator: '',
    subscriptionId: '',
    keyHash: '',
    gasLimit: '',
    confirmations: ''
  });

  // Helper function to safely stringify objects with BigInt
  const safeStringify = (obj) => {
    return JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() + 'n' : value
    );
  };

  // Debug logging
  useEffect(() => {
    console.log('VRFSettings received props:', {
      vrfConfig: vrfConfig ? safeStringify(vrfConfig) : 'undefined',
      isLoading,
      isAdmin,
      hasContract: !!contract
    });
  }, [vrfConfig, isLoading, isAdmin, contract]);

  // Update local state when vrfConfig changes
  useEffect(() => {
    if (vrfConfig) {
      console.log('Updating VRF settings from config:', safeStringify(vrfConfig));
      
      // Handle both array and object formats
      let configData;
      if (Array.isArray(vrfConfig)) {
        // If vrfConfig is an array (from contract call)
        configData = {
          vrfCoordinator: vrfConfig[0],
          subscriptionId: vrfConfig[1],
          keyHash: vrfConfig[2],
          callbackGasLimit: vrfConfig[3],
          requestConfirmations: vrfConfig[4]
        };
      } else {
        // If vrfConfig is already an object
        configData = vrfConfig;
      }

      setSettings({
        coordinator: configData.vrfCoordinator || '',
        subscriptionId: configData.subscriptionId?.toString() || '',
        keyHash: configData.keyHash || '',
        gasLimit: configData.callbackGasLimit?.toString() || '',
        confirmations: configData.requestConfirmations?.toString() || ''
      });
    }
  }, [vrfConfig]);

  const handleVRFUpdate = async (setting, value) => {
    if (!isAdmin) {
      onError('Admin access required');
      return;
    }

    if (!value) {
      onError('Please provide a value');
      return;
    }

    try {
      let result;
      
      switch (setting) {
        case 'coordinator':
          result = await contract.updateVRFCoordinator(value);
          break;
        case 'subscriptionId':
          result = await contract.updateVRFSubscriptionId(BigInt(value));
          break;
        case 'keyHash':
          result = await contract.updateVRFKeyHash(value);
          break;
        case 'gasLimit':
          result = await contract.updateVRFGasLimit(parseInt(value));
          break;
        case 'confirmations':
          result = await contract.updateVRFConfirmations(parseInt(value));
          break;
        default:
          onError(`Unknown VRF setting: ${setting}`);
          return;
      }
      
      onSuccess(`VRF ${setting} updated successfully! Transaction: ${result}`);
    } catch (error) {
      console.error(`Error updating VRF ${setting}:`, error);
      onError(`Failed to update VRF ${setting}: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateAll = async () => {
    if (!isAdmin) {
      onError('Admin access required');
      return;
    }

    if (!settings.coordinator || !settings.subscriptionId || !settings.keyHash || 
        !settings.gasLimit || !settings.confirmations) {
      onError('Please fill in all fields');
      return;
    }

    try {
      const result = await contract.updateVRFConfig(
        settings.coordinator,
        BigInt(settings.subscriptionId),
        settings.keyHash,
        parseInt(settings.gasLimit),
        parseInt(settings.confirmations)
      );
      
      onSuccess(`All VRF settings updated successfully! Transaction: ${result}`);
    } catch (error) {
      console.error('Error updating VRF config:', error);
      onError(`Failed to update VRF config: ${error.message || 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="section-title">🎲 VRF Settings</h3>
        <div className="loading-state">
          <p>Loading VRF configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="section-title">🎲 VRF Settings</h3>
      <p>Configure Chainlink VRF settings for random number generation</p>
      
      <div className="vrf-settings">
        <div className="vrf-setting">
          <label className="vrf-label">VRF Coordinator:</label>
          <input 
            type="text" 
            value={settings.coordinator} 
            onChange={(e) => setSettings({...settings, coordinator: e.target.value})}
            placeholder={
              Array.isArray(vrfConfig) ? vrfConfig[0] || "0x..." : 
              vrfConfig?.vrfCoordinator || "0x..."
            }
            className="vrf-input"
          />
          <button 
            onClick={() => handleVRFUpdate('coordinator', settings.coordinator)}
            disabled={!isAdmin || contract?.isWritePending}
            className="vrf-button"
          >
            {contract?.isWritePending ? 'Updating...' : 'Update'}
          </button>
        </div>
        
        <div className="vrf-setting">
          <label className="vrf-label">Subscription ID:</label>
          <input 
            type="number" 
            value={settings.subscriptionId} 
            onChange={(e) => setSettings({...settings, subscriptionId: e.target.value})}
            placeholder={
              Array.isArray(vrfConfig) ? vrfConfig[1]?.toString() || "123456" : 
              vrfConfig?.subscriptionId?.toString() || "123456"
            }
            className="vrf-input"
          />
          <button 
            onClick={() => handleVRFUpdate('subscriptionId', settings.subscriptionId)}
            disabled={!isAdmin || contract?.isWritePending}
            className="vrf-button"
          >
            {contract?.isWritePending ? 'Updating...' : 'Update'}
          </button>
        </div>
        
        <div className="vrf-setting">
          <label className="vrf-label">Key Hash (Base Network):</label>
          <select 
            value={settings.keyHash} 
            onChange={(e) => setSettings({...settings, keyHash: e.target.value})}
            className="vrf-input"
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
            onClick={() => handleVRFUpdate('keyHash', settings.keyHash)}
            disabled={!isAdmin || contract?.isWritePending}
            className="vrf-button"
          >
            {contract?.isWritePending ? 'Updating...' : 'Update'}
          </button>
        </div>
        
        <div className="vrf-setting">
          <label className="vrf-label">Gas Limit:</label>
          <input 
            type="number" 
            value={settings.gasLimit} 
            onChange={(e) => setSettings({...settings, gasLimit: e.target.value})}
            placeholder={
              Array.isArray(vrfConfig) ? vrfConfig[3]?.toString() || "100000" : 
              vrfConfig?.callbackGasLimit?.toString() || "100000"
            }
            min="50000"
            max="2500000"
            className="vrf-input"
          />
          <button 
            onClick={() => handleVRFUpdate('gasLimit', settings.gasLimit)}
            disabled={!isAdmin || contract?.isWritePending}
            className="vrf-button"
          >
            {contract?.isWritePending ? 'Updating...' : 'Update'}
          </button>
        </div>
        
        <div className="vrf-setting">
          <label className="vrf-label">Confirmations:</label>
          <input 
            type="number" 
            value={settings.confirmations} 
            onChange={(e) => setSettings({...settings, confirmations: e.target.value})}
            placeholder={
              Array.isArray(vrfConfig) ? vrfConfig[4]?.toString() || "3" : 
              vrfConfig?.requestConfirmations?.toString() || "3"
            }
            min="1"
            max="200"
            className="vrf-input"
          />
          <button 
            onClick={() => handleVRFUpdate('confirmations', settings.confirmations)}
            disabled={!isAdmin || contract?.isWritePending}
            className="vrf-button"
          >
            {contract?.isWritePending ? 'Updating...' : 'Update'}
          </button>
        </div>

        {/* Update All Button */}
        <div className="vrf-setting" style={{ gridTemplateColumns: '1fr auto', gap: '16px' }}>
          <div>
            <strong>Update All Settings</strong>
            <br />
            <small>Update all VRF settings in a single transaction</small>
          </div>
          <button 
            onClick={handleUpdateAll}
            disabled={!isAdmin || contract?.isWritePending}
            className="vrf-button"
            style={{ background: '#28a745' }}
          >
            {contract?.isWritePending ? 'Updating...' : 'Update All'}
          </button>
        </div>
      </div>

      {/* Current Configuration Display - Enhanced */}
      {vrfConfig && (
        <div style={{ marginTop: '30px' }}>
          <h4>📋 Current VRF Configuration</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Coordinator:</span>
              <span className="status-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {(Array.isArray(vrfConfig) ? vrfConfig[0] : vrfConfig.vrfCoordinator) || 'Not set'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Subscription ID:</span>
              <span className="status-value">
                {(Array.isArray(vrfConfig) ? vrfConfig[1]?.toString() : vrfConfig.subscriptionId?.toString()) || 'Not set'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Key Hash:</span>
              <span className="status-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {(Array.isArray(vrfConfig) ? vrfConfig[2] : vrfConfig.keyHash) || 'Not set'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Gas Limit:</span>
              <span className="status-value">
                {(Array.isArray(vrfConfig) ? vrfConfig[3]?.toString() : vrfConfig.callbackGasLimit?.toString()) || 'Not set'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Confirmations:</span>
              <span className="status-value">
                {(Array.isArray(vrfConfig) ? vrfConfig[4]?.toString() : vrfConfig.requestConfirmations?.toString()) || 'Not set'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No Config Message */}
      {!vrfConfig && !isLoading && (
        <div className="info-state" style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p>⚠️ No VRF configuration found. This could mean:</p>
          <ul>
            <li>The contract is not properly connected</li>
            <li>The getVRFConfig function is not available</li>
            <li>There's a network connectivity issue</li>
          </ul>
          <p>Please check your wallet connection and try refreshing.</p>
        </div>
      )}
    </div>
  );
};

export default VRFSettings;

