import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { metaMask, coinbaseWallet, injected } from 'wagmi/connectors';

// Fixed configuration without WalletConnect to avoid API errors
export const config = createConfig({
  chains: [base],
  connectors: [
    injected({ 
      target: 'metaMask',
    }),
    metaMask({
      dappMetadata: {
        name: 'FlipSki V2 Admin',
        url: 'https://flipski.com',
        iconUrl: 'https://flipski.com/icon.png'
      }
    }),
    coinbaseWallet({
      appName: 'FlipSki V2 Admin',
      appLogoUrl: 'https://flipski.com/logo.png',
      preference: 'smartWalletOnly'
    })
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org')
  },
  ssr: false
});

// Contract addresses
export const FLIPSKI_V2_CONTRACT_ADDRESS = "0x448eF253449bFfd25e19C571FE381a4b0E05e87b";

// ETH address constant
export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

// Base network info
export const BASE_NETWORK = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://mainnet.base.org'] },
    default: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'BaseScan', url: 'https://basescan.org' },
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
};

