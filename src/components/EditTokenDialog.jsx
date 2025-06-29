import { useState } from 'react';

const EditTokenDialog = ({ token, onClose, onSuccess, onError, contract, isAdmin }) => {
  const [minWager, setMinWager] = useState(token.minWagerFormatted.toString());
  const [maxWager, setMaxWager] = useState(token.maxWagerFormatted.toString());

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
      // Convert to wei
      const minWagerWei = contract.parseTokenAmount(minWager);
      const maxWagerWei = contract.parseTokenAmount(maxWager);
      
      const result = await contract.updateTokenConfig(token.address, minWagerWei, maxWagerWei);
      onSuccess(`Token configuration updated successfully! Transaction: ${result}`);
    } catch (error) {
      console.error('Error updating token:', error);
      onError(`Failed to update token: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">✏️ Edit Token: {token.symbol}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label className="form-label">Token:</label>
            <div className="token-display">
              <strong>{token.symbol}</strong> - {token.name}
              <br />
              <small style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {token.address}
              </small>
              <br />
              <small style={{ color: '#6c757d' }}>
                Decimals: {token.decimals}
              </small>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Wager (in {token.symbol}):</label>
            <input
              type="number"
              step="any"
              value={minWager}
              onChange={(e) => setMinWager(e.target.value)}
              required
              className="form-input"
            />
            <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
              Current: {token.minWagerFormatted} {token.symbol}
            </small>
          </div>
          <div className="form-group">
            <label className="form-label">Maximum Wager (in {token.symbol}):</label>
            <input
              type="number"
              step="any"
              value={maxWager}
              onChange={(e) => setMaxWager(e.target.value)}
              required
              className="form-input"
            />
            <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
              Current: {token.maxWagerFormatted} {token.symbol}
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
              {contract.isWritePending ? 'Updating...' : 'Update Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTokenDialog;

