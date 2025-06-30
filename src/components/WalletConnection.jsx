import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import '../styles/WalletConnection.css';

const WalletConnection = ({ onWalletChange, onContractChange, onAdminStatusChange }) => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showConnectors, setShowConnectors] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin addresses - UPDATE THESE WITH YOUR ACTUAL ADMIN ADDRESSES
  const adminAddresses = [
    '0xf562BaFabdB96cA6d1FF978A9663903BaCa60b1b',
    '0xf08d3184c50a1B255507785F71c9330034852Cd5' // Replace with your admin address
  ];

  // Mock contract instance - replace with your actual contract setup
  useEffect(() => {
    if (isConnected && address) {
      // Notify parent components
      onWalletChange?.(address);
      
      // Mock contract - replace with your actual contract initialization
      const mockContract = {
        address: '0xD1a769B61C705689b0B37057C076Bd84c0F50a38',
        read: {
          getActiveTokens: async () => {
            // Mock data - replace with actual contract calls
            return [
              ['0x0000000000000000000000000000000000000000', '0xE4b2F8B5B9497222093e2B1Afb98CE2728D3bB07'],
              [
                {
                  tokenAddress: '0x0000000000000000000000000000000000000000',
                  symbol: 'ETH',
                  name: 'Ethereum',
                  decimals: 18,
                  minWager: '1000000000000000', // 0.001 ETH
                  maxWager: '10000000000000000000', // 10 ETH
                  isActive: true,
                  isPaused: false
                },
                {
                  tokenAddress: '0xE4b2F8B5B9497222093e2B1Afb98CE2728D3bB07',
                  symbol: 'FLIPSKI',
                  name: 'FlipSki Token',
                  decimals: 18,
                  minWager: '1000000000000000000000000', // 1M tokens
                  maxWager: '100000000000000000000000000', // 100M tokens
                  isActive: true,
                  isPaused: false
                }
              ]
            ];
          },
          getContractStats: async () => ({
            totalGamesPlayed: 0,
            totalVolumeETH: 0,
            totalFeesCollected: 0,
            totalPlayersServed: 0
          }),
          getVRFConfig: async () => ({
            vrfCoordinator: '0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634',
            subscriptionId: 0,
            keyHash: '0xdc2f87677b01473c763cb0aee938ed3341512f6057324a584e5944e786144d70',
            callbackGasLimit: 100000,
            requestConfirmations: 3
          })
        },
        write: {
          addToken: async (args) => {
            console.log('Adding token:', args);
            return '0x1234567890abcdef';
          },
          removeToken: async (args) => {
            console.log('Removing token:', args);
            return '0x1234567890abcdef';
          },
          updateTokenConfig: async (args) => {
            console.log('Updating token config:', args);
            return '0x1234567890abcdef';
          },
          setTokenPaused: async (args) => {
            console.log('Setting token paused:', args);
            return '0x1234567890abcdef';
          },
          pauseContract: async () => {
            console.log('Pausing contract');
            return '0x1234567890abcdef';
          },
          unpauseContract: async () => {
            console.log('Unpausing contract');
            return '0x1234567890abcdef';
          }
        }
      };
      
      onContractChange?.(mockContract);
      
      // Check admin status
      const isUserAdmin = adminAddresses.some(adminAddr => 
        adminAddr.toLowerCase() === address.toLowerCase()
      );
      setIsAdmin(isUserAdmin);
      onAdminStatusChange?.(isUserAdmin);
    } else {
      onWalletChange?.('');
      onContractChange?.(null);
      onAdminStatusChange?.(false);
      setIsAdmin(false);
    }
  }, [isConnected, address, onWalletChange, onContractChange, onAdminStatusChange]);

  const handleConnect = async (connector) => {
    try {
      await connect({ connector });
      setShowConnectors(false);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowConnectors(false);
  };

  // Filter out connectors that aren't ready
  const availableConnectors = connectors.filter(connector => connector.ready !== false);

  if (!isConnected) {
    return (
      <div className="wallet-connection">
        <div className="wallet-status">
          <h3>🔗 Connect Your Wallet</h3>
          <p>Connect your wallet to access the admin panel</p>
          
          {error && (
            <div className="connection-error">
              ❌ Connection failed: {error.message}
            </div>
          )}
          
          <button 
            onClick={() => setShowConnectors(!showConnectors)}
            className="connect-btn"
            disabled={isConnecting || isPending}
          >
            {isConnecting || isPending ? 'Connecting...' : showConnectors ? 'Hide Options' : 'Connect Wallet'}
          </button>

          {showConnectors && (
            <div className="connector-options">
              {availableConnectors.length > 0 ? (
                availableConnectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => handleConnect(connector)}
                    className="connector-btn"
                    disabled={isPending || isConnecting}
                  >
                    <span className="connector-icon">
                      {connector.name === 'MetaMask' && '🦊'}
                      {connector.name === 'Coinbase Wallet' && '🔵'}
                      {connector.name === 'Injected' && '🔗'}
                      {!['MetaMask', 'Coinbase Wallet', 'Injected'].includes(connector.name) && '💼'}
                    </span>
                    {connector.name}
                    {isPending && ' (connecting...)'}
                  </button>
                ))
              ) : (
                <div className="no-connectors">
                  <p>No wallet connectors available.</p>
                  <p>Please install MetaMask or Coinbase Wallet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connection">
      <div className="wallet-info">
        <div className="wallet-details">
          <div className="wallet-address">
            <strong>🔗 Connected:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div className="admin-status">
            <strong>👤 Role:</strong> 
            <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
              {isAdmin ? '👑 Admin' : '👤 User'}
            </span>
          </div>
        </div>
        <button onClick={handleDisconnect} className="disconnect-btn">
          Disconnect
        </button>
      </div>
      
      {!isAdmin && (
        <div className="access-warning">
          ⚠️ You don't have admin access. Some features will be disabled.
        </div>
      )}
    </div>
  );
};

export default WalletConnection;

