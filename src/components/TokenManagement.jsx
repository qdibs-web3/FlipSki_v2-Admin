import { useState } from 'react';
import AddTokenDialog from './AddTokenDialog';
import EditTokenDialog from './EditTokenDialog';

const TokenManagement = ({ tokens, isLoading, isAdmin, contract, onSuccess, onError }) => {
  const [showAddToken, setShowAddToken] = useState(false);
  const [editingToken, setEditingToken] = useState(null);

  const handleTokenAction = async (action, tokenAddress, ...args) => {
    if (!isAdmin) {
      onError('Admin access required');
      return;
    }

    try {
      let result;
      
      switch (action) {
        case 'pause':
          result = await contract.setTokenPaused(tokenAddress, true);
          onSuccess(`Token paused successfully! Transaction: ${result}`);
          break;
        case 'unpause':
          result = await contract.setTokenPaused(tokenAddress, false);
          onSuccess(`Token unpaused successfully! Transaction: ${result}`);
          break;
        case 'remove':
          if (window.confirm('Are you sure you want to remove this token?')) {
            result = await contract.removeToken(tokenAddress);
            onSuccess(`Token removed successfully! Transaction: ${result}`);
          }
          break;
        case 'update':
          const [minWager, maxWager] = args;
          result = await contract.updateTokenConfig(tokenAddress, minWager, maxWager);
          onSuccess(`Token configuration updated! Transaction: ${result}`);
          break;
        default:
          onError(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error ${action} token:`, error);
      onError(`Failed to ${action} token: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div>
      <div className="tokens-header">
        <h3 className="section-title">🪙 Token Management</h3>
        <button 
          onClick={() => setShowAddToken(true)}
          className="add-token-btn"
          disabled={!isAdmin || isLoading}
        >
          {isLoading ? '⏳ Loading...' : '➕ Add Token'}
        </button>
      </div>

      <div className="tokens-table">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Token</th>
              <th className="table-header">Min Wager</th>
              <th className="table-header">Max Wager</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.length > 0 ? tokens.map((token, index) => (
              <tr key={index}>
                <td className="table-cell">
                  <div className="token-info">
                    <span className="token-symbol">{token.symbol}</span>
                    <span className="token-name">{token.name}</span>
                    <div className="token-address">{token.address.slice(0, 10)}...</div>
                  </div>
                </td>
                <td className="table-cell">{token.minWagerFormatted} {token.symbol}</td>
                <td className="table-cell">{token.maxWagerFormatted} {token.symbol}</td>
                <td className="table-cell">
                  <span className={`status-badge ${token.isPaused ? 'status-paused' : 'status-active'}`}>
                    {token.isPaused ? 'Paused' : 'Active'}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="table-action-buttons">
                    <button 
                      onClick={() => setEditingToken(token)}
                      className="btn-edit"
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
                      className="btn-edit"
                      disabled={!isAdmin || isLoading}
                      title={token.isPaused ? 'Unpause token' : 'Pause token'}
                    >
                      {token.isPaused ? '▶️' : '⏸️'}
                    </button>
                    {token.address !== '0x0000000000000000000000000000000000000000' && (
                      <button 
                        onClick={() => handleTokenAction('remove', token.address)}
                        className="btn-edit"
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
                <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>
                  {isLoading ? 'Loading tokens...' : 'No tokens found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Token Dialog */}
      {showAddToken && (
        <AddTokenDialog
          onClose={() => setShowAddToken(false)}
          onSuccess={(message) => {
            onSuccess(message);
            setShowAddToken(false);
          }}
          onError={onError}
          contract={contract}
          isAdmin={isAdmin}
        />
      )}

      {/* Edit Token Dialog */}
      {editingToken && (
        <EditTokenDialog
          token={editingToken}
          onClose={() => setEditingToken(null)}
          onSuccess={(message) => {
            onSuccess(message);
            setEditingToken(null);
          }}
          onError={onError}
          contract={contract}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default TokenManagement;

