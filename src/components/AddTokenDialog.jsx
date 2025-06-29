import { useState } from 'react';

const AddTokenDialog = ({ onClose, onSuccess, onError, contract, isAdmin }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [minWager, setMinWager] = useState('');
  const [maxWager, setMaxWager] = useState('');

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

    // Validate addresses
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      onError('Invalid token address format');
      return;
    }

    // Validate wager amounts
    if (parseFloat(minWager) <= 0 || parseFloat(maxWager) <= 0) {
      onError('Wager amounts must be greater than 0');
      return;
    }

    if (parseFloat(maxWager) <= parseFloat(minWager)) {
      onError('Maximum wager must be greater than minimum wager');
      return;
    }

    try {
      // Convert to wei (assuming 18 decimals for simplicity)
      const minWagerWei = contract.parseTokenAmount(minWager);
      const maxWagerWei = contract.parseTokenAmount(maxWager);
      
      const result = await contract.addToken(tokenAddress, minWagerWei, maxWagerWei);
      onSuccess(`Token added successfully! Transaction: ${result}`);
    } catch (error) {
      console.error('Error adding token:', error);
      onError(`Failed to add token: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">➕ Add New Token</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label className="form-label">Token Address:</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              required
              className="form-input"
            />
            <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
              Enter the contract address of the ERC20 token
            </small>
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Wager (in token units):</label>
            <input
              type="number"
              step="any"
              value={minWager}
              onChange={(e) => setMinWager(e.target.value)}
              placeholder="1.0"
              required
              className="form-input"
            />
            <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
              Minimum amount players can wager (e.g., 1.0 for 1 token)
            </small>
          </div>
          <div className="form-group">
            <label className="form-label">Maximum Wager (in token units):</label>
            <input
              type="number"
              step="any"
              value={maxWager}
              onChange={(e) => setMaxWager(e.target.value)}
              placeholder="1000.0"
              required
              className="form-input"
            />
            <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
              Maximum amount players can wager (e.g., 1000.0 for 1000 tokens)
            </small>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={contract.isWritePending} 
              className="btn-submit"
            >
              {contract.isWritePending ? 'Adding...' : 'Add Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTokenDialog;

