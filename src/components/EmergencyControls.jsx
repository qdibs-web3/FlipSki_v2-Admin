const EmergencyControls = ({ isAdmin, contract, onSuccess, onError }) => {
  
  const handleEmergencyAction = async (action) => {
    if (!isAdmin) {
      onError('Admin access required');
      return;
    }

    const confirmMessage = action === 'pause' 
      ? 'Are you sure you want to pause the entire contract? This will stop all game operations.' 
      : 'Are you sure you want to unpause the contract? This will resume all game operations.';
    
    if (!window.confirm(confirmMessage)) return;

    try {
      let result;
      
      if (action === 'pause') {
        result = await contract.pauseContract();
        onSuccess(`Contract paused successfully! Transaction: ${result}`);
      } else {
        result = await contract.unpauseContract();
        onSuccess(`Contract unpaused successfully! Transaction: ${result}`);
      }
    } catch (error) {
      console.error(`Error ${action} contract:`, error);
      onError(`Failed to ${action} contract: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!isAdmin) {
      onError('Admin access required');
      return;
    }

    const tokenAddress = window.prompt('Enter token address (use 0x0000000000000000000000000000000000000000 for ETH):');
    if (!tokenAddress) return;

    const amount = window.prompt('Enter amount to withdraw (in wei for tokens, or ETH amount):');
    if (!amount) return;

    const confirmMessage = `Are you sure you want to withdraw ${amount} of ${tokenAddress === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'tokens'}?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      let withdrawAmount;
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        // For ETH, convert to wei
        withdrawAmount = contract.parseTokenAmount(amount);
      } else {
        // For tokens, assume amount is already in wei
        withdrawAmount = BigInt(amount);
      }

      const result = await contract.emergencyWithdraw(tokenAddress, withdrawAmount);
      onSuccess(`Emergency withdrawal successful! Transaction: ${result}`);
    } catch (error) {
      console.error('Error in emergency withdrawal:', error);
      onError(`Emergency withdrawal failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div>
      <div className="emergency-header">
        <h3 className="emergency-title">🚨 Emergency Controls</h3>
        <p className="warning-text">
          ⚠️ These actions affect the entire contract. Use with extreme caution!
        </p>
      </div>

      <div className="emergency-actions">
        <div>
          <h4>Contract Controls</h4>
          <div className="emergency-buttons">
            <button 
              onClick={() => handleEmergencyAction('pause')}
              className="emergency-btn emergency-btn-pause"
              disabled={!isAdmin || contract.isWritePending}
            >
              ⏸️ {contract.isWritePending ? 'Processing...' : 'Pause Contract'}
            </button>
            <button 
              onClick={() => handleEmergencyAction('unpause')}
              className="emergency-btn emergency-btn-unpause"
              disabled={!isAdmin || contract.isWritePending}
            >
              ▶️ {contract.isWritePending ? 'Processing...' : 'Unpause Contract'}
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: '8px 0 0 0' }}>
            Pausing the contract will stop all game operations. Unpausing will resume normal operations.
          </p>
        </div>

        <div>
          <h4>Emergency Withdrawal</h4>
          <div className="emergency-buttons">
            <button 
              onClick={handleEmergencyWithdraw}
              className="emergency-btn"
              style={{ background: '#dc3545', color: 'white' }}
              disabled={!isAdmin || contract.isWritePending}
            >
              💸 {contract.isWritePending ? 'Processing...' : 'Emergency Withdraw'}
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: '8px 0 0 0' }}>
            Withdraw funds from the contract in case of emergency. This should only be used in critical situations.
          </p>
        </div>

        {!isAdmin && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            textAlign: 'center'
          }}>
            <strong>⚠️ Admin Access Required</strong>
            <br />
            You need admin privileges to use emergency controls.
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <h4>Important Notes</h4>
          <div style={{ 
            background: '#fff3cd', 
            color: '#856404', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li><strong>Contract Pause:</strong> Stops all game operations but preserves existing games</li>
              <li><strong>Emergency Withdrawal:</strong> Should only be used in critical situations</li>
              <li><strong>All actions are irreversible</strong> and will be recorded on the blockchain</li>
              <li><strong>Gas fees apply</strong> to all emergency operations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyControls;

