import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/web3';
import AdminDashboard from './components/AdminDashboardOptimized'; // Use optimized version
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="app">
          <AdminDashboard />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;