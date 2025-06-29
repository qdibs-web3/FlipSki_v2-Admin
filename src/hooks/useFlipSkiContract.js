import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import FlipSkiV2ABI from '../lib/FlipSkiV2ABI.json';

// Contract address from deployment info
export const FLIPSKI_V2_CONTRACT_ADDRESS = "0x448eF253449bFfd25e19C571FE381a4b0E05e87b";

// ETH address constant
export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";

export const useFlipSkiContract = () => {
  const { writeContract, data: hash, error: writeError, isPending: isWritePending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read functions
  const useGetActiveTokens = () => {
    return useReadContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'getActiveTokens',
    });
  };

  const useGetContractStats = () => {
    return useReadContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'getContractStats',
    });
  };

  const useGetVRFConfig = () => {
    return useReadContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'getVRFConfig',
    });
  };

  const useGetTokenConfig = (tokenAddress) => {
    return useReadContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'getTokenConfig',
      args: [tokenAddress],
      enabled: !!tokenAddress,
    });
  };

  const useGetContractBalance = (tokenAddress) => {
    return useReadContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'getContractBalance',
      args: [tokenAddress],
      enabled: !!tokenAddress,
    });
  };

  const useIsTokenSupported = (tokenAddress) => {
    return useReadContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'isTokenSupported',
      args: [tokenAddress],
      enabled: !!tokenAddress,
    });
  };

  // Write functions
  const addToken = async (tokenAddress, minWager, maxWager) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'addToken',
      args: [tokenAddress, minWager, maxWager],
    });
  };

  const removeToken = async (tokenAddress) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'removeToken',
      args: [tokenAddress],
    });
  };

  const updateTokenConfig = async (tokenAddress, minWager, maxWager) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'updateTokenConfig',
      args: [tokenAddress, minWager, maxWager],
    });
  };

  const setTokenPaused = async (tokenAddress, isPaused) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'setTokenPaused',
      args: [tokenAddress, isPaused],
    });
  };

  const updateFeeConfig = async (newFeePercentage, newFeeWallet) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'updateFeeConfig',
      args: [newFeePercentage, newFeeWallet],
    });
  };

  const pauseContract = async () => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'pauseContract',
    });
  };

  const unpauseContract = async () => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'unpauseContract',
    });
  };

  // VRF Management functions
  const updateVRFCoordinator = async (newCoordinator) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'updateVRFCoordinator',
      args: [newCoordinator],
    });
  };

  const updateVRFSubscriptionId = async (newSubscriptionId) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'updateVRFSubscriptionId',
      args: [newSubscriptionId],
    });
  };

  const updateVRFKeyHash = async (newKeyHash) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'updateVRFKeyHash',
      args: [newKeyHash],
    });
  };

  const updateVRFGasLimit = async (newGasLimit) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'updateVRFGasLimit',
      args: [newGasLimit],
    });
  };

  const updateVRFConfirmations = async (newConfirmations) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'updateVRFConfirmations',
      args: [newConfirmations],
    });
  };

  const updateVRFConfig = async (coordinator, subscriptionId, keyHash, gasLimit, confirmations) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'updateVRFConfig',
      args: [coordinator, subscriptionId, keyHash, gasLimit, confirmations],
    });
  };

  const emergencyWithdraw = async (tokenAddress, amount) => {
    return writeContract({
      address: FLIPSKI_V2_CONTRACT_ADDRESS,
      abi: FlipSkiV2ABI,
      functionName: 'emergencyWithdraw',
      args: [tokenAddress, amount],
    });
  };

  // Utility functions
  const formatTokenAmount = (amount, decimals = 18) => {
    try {
      return formatEther(BigInt(amount));
    } catch (error) {
      console.error('Error formatting token amount:', error);
      return '0';
    }
  };

  const parseTokenAmount = (amount, decimals = 18) => {
    try {
      return parseEther(amount.toString());
    } catch (error) {
      console.error('Error parsing token amount:', error);
      return BigInt(0);
    }
  };

  return {
    // Read hooks
    useGetActiveTokens,
    useGetContractStats,
    useGetVRFConfig,
    useGetTokenConfig,
    useGetContractBalance,
    useIsTokenSupported,
    
    // Write functions
    addToken,
    removeToken,
    updateTokenConfig,
    setTokenPaused,
    updateFeeConfig,
    pauseContract,
    unpauseContract,
    updateVRFCoordinator,
    updateVRFSubscriptionId,
    updateVRFKeyHash,
    updateVRFGasLimit,
    updateVRFConfirmations,
    updateVRFConfig,
    emergencyWithdraw,
    
    // Utility functions
    formatTokenAmount,
    parseTokenAmount,
    
    // Transaction state
    hash,
    writeError,
    isWritePending,
    isConfirming,
    isConfirmed,
  };
};

