import { useState, useEffect } from 'react';

const VRFSettings = ({ vrfConfig, isLoading, isAdmin, contract, onSuccess, onError }) => {
  const [settings, setSettings] = useState({
    coordinator: '',
    subscriptionId: '',
    keyHash: '',
    gasLimit: '',
    confirmations: ''
  });

  // Update local state when vrfConfig changes
  useEffect(() => {
    if (vrfConfig) {
      setSettings({
        coordinator: vrfConfig.vrfCoordinator || '',
        subscriptionId: vrfConfig.subscriptionId?.toString() || '',
        keyHash: vrfConfig.keyHash || '',
        gasLimit: vrfConfig.callbackGasLimit?.toString() || '',
        confirmations: vrfConfig.requestConfirmations?.toString() || ''
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
        <p>Loading VRF configuration...</p>
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
            placeholder="0x..."
            className="vrf-input"
          />
          <button 
            onClick={() => handleVRFUpdate('coordinator', settings.coordinator)}
            disabled={!isAdmin || contract.isWritePending}
            className="vrf-button"
          >
            {contract.isWritePending ? 'Updating...' : 'Update'}
          </button>
        </div>
        
        <div className="vrf-setting">
          <label className="vrf-label">Subscription ID:</label>
          <input 
            type="number" 
            value={settings.subscriptionId} 
            onChange={(e) => setSettings({...settings, subscriptionId: e.target.value})}
            placeholder="123456"
            className="vrf-input"
          />
          <button 
            onClick={() => handleVRFUpdate('subscriptionId', settings.subscriptionId)}
            disabled={!isAdmin || contract.isWritePending}
            className="vrf-button"
          >
            {contract.isWritePending ? 'Updating...' : 'Update'}
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
            disabled={!isAdmin || contract.isWritePending}
            className="vrf-button"
          >
            {contract.isWritePending ? 'Updating...' : 'Update'}
          </button>
        </div>
        
        <div className="vrf-setting">
          <label className="vrf-label">Gas Limit:</label>
          <input 
            type="number" 
            value={settings.gasLimit} 
            onChange={(e) => setSettings({...settings, gasLimit: e.target.value})}
            placeholder="100000"
            min="50000"
            max="2500000"
            className="vrf-input"
          />
          <button 
            onClick={() => handleVRFUpdate('gasLimit', settings.gasLimit)}
            disabled={!isAdmin || contract.isWritePending}
            className="vrf-button"
          >
            {contract.isWritePending ? 'Updating...' : 'Update'}
          </button>
        </div>
        
        <div className="vrf-setting">
          <label className="vrf-label">Confirmations:</label>
          <input 
            type="number" 
            value={settings.confirmations} 
            onChange={(e) => setSettings({...settings, confirmations: e.target.value})}
            placeholder="3"
            min="1"
            max="200"
            className="vrf-input"
          />
          <button 
            onClick={() => handleVRFUpdate('confirmations', settings.confirmations)}
            disabled={!isAdmin || contract.isWritePending}
            className="vrf-button"
          >
            {contract.isWritePending ? 'Updating...' : 'Update'}
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
            disabled={!isAdmin || contract.isWritePending}
            className="vrf-button"
            style={{ background: '#28a745' }}
          >
            {contract.isWritePending ? 'Updating...' : 'Update All'}
          </button>
        </div>
      </div>

      {/* Current Configuration Display */}
      {vrfConfig && (
        <div style={{ marginTop: '30px' }}>
          <h4>Current Configuration</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Coordinator:</span>
              <span className="status-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {vrfConfig.vrfCoordinator}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Subscription ID:</span>
              <span className="status-value">{vrfConfig.subscriptionId?.toString()}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Gas Limit:</span>
              <span className="status-value">{vrfConfig.callbackGasLimit?.toString()}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Confirmations:</span>
              <span className="status-value">{vrfConfig.requestConfirmations?.toString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VRFSettings;

