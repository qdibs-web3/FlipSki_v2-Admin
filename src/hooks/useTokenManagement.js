import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { FLIPSKI_V2_CONTRACT_ADDRESS, FLIPSKI_V2_ABI, ADMIN_ROLE, TOKEN_MANAGER_ROLE } from '../lib/web3'

export function useTokenManagement() {
  const { address } = useAccount()
  const [tokens, setTokens] = useState([])
  const [error, setError] = useState(null)

  // Check if user has admin role
  const { data: hasAdminRole } = useReadContract({
    address: FLIPSKI_V2_CONTRACT_ADDRESS,
    abi: FLIPSKI_V2_ABI,
    functionName: 'hasRole',
    args: [ADMIN_ROLE, address],
    query: { enabled: !!address }
  })

  // Check if user has token manager role
  const { data: hasTokenManagerRole } = useReadContract({
    address: FLIPSKI_V2_CONTRACT_ADDRESS,
    abi: FLIPSKI_V2_ABI,
    functionName: 'hasRole',
    args: [TOKEN_MANAGER_ROLE, address],
    query: { enabled: !!address }
  })

  // Get active tokens
  const { data: activeTokensData, refetch: refetchTokens } = useReadContract({
    address: FLIPSKI_V2_CONTRACT_ADDRESS,
    abi: FLIPSKI_V2_ABI,
    functionName: 'getActiveTokens',
  })

  // Write contract hooks
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Process tokens data
  useEffect(() => {
    if (activeTokensData) {
      const [addresses, configs] = activeTokensData
      const processedTokens = addresses.map((address, index) => ({
        address,
        ...configs[index],
        minWagerFormatted: formatUnits(configs[index].minWager, configs[index].decimals),
        maxWagerFormatted: formatUnits(configs[index].maxWager, configs[index].decimals),
      }))
      setTokens(processedTokens)
    }
  }, [activeTokensData])

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      refetchTokens()
      setError(null)
    }
  }, [isSuccess, refetchTokens])

  // Handle errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message)
    }
  }, [writeError])

  const addToken = async (tokenAddress, minWager, maxWager, decimals) => {
    try {
      setError(null)
      const minWagerWei = parseUnits(minWager, decimals)
      const maxWagerWei = parseUnits(maxWager, decimals)
      
      await writeContract({
        address: FLIPSKI_V2_CONTRACT_ADDRESS,
        abi: FLIPSKI_V2_ABI,
        functionName: 'addToken',
        args: [tokenAddress, minWagerWei, maxWagerWei],
      })
    } catch (error) {
      setError(error.message)
    }
  }

  const removeToken = async (tokenAddress) => {
    try {
      setError(null)
      await writeContract({
        address: FLIPSKI_V2_CONTRACT_ADDRESS,
        abi: FLIPSKI_V2_ABI,
        functionName: 'removeToken',
        args: [tokenAddress],
      })
    } catch (error) {
      setError(error.message)
    }
  }

  const updateTokenConfig = async (tokenAddress, minWager, maxWager, decimals) => {
    try {
      setError(null)
      const minWagerWei = parseUnits(minWager, decimals)
      const maxWagerWei = parseUnits(maxWager, decimals)
      
      await writeContract({
        address: FLIPSKI_V2_CONTRACT_ADDRESS,
        abi: FLIPSKI_V2_ABI,
        functionName: 'updateTokenConfig',
        args: [tokenAddress, minWagerWei, maxWagerWei],
      })
    } catch (error) {
      setError(error.message)
    }
  }

  const setTokenPaused = async (tokenAddress, isPaused) => {
    try {
      setError(null)
      await writeContract({
        address: FLIPSKI_V2_CONTRACT_ADDRESS,
        abi: FLIPSKI_V2_ABI,
        functionName: 'setTokenPaused',
        args: [tokenAddress, isPaused],
      })
    } catch (error) {
      setError(error.message)
    }
  }

  const pauseContract = async () => {
    try {
      setError(null)
      await writeContract({
        address: FLIPSKI_V2_CONTRACT_ADDRESS,
        abi: FLIPSKI_V2_ABI,
        functionName: 'pauseContract',
        args: [],
      })
    } catch (error) {
      setError(error.message)
    }
  }

  const unpauseContract = async () => {
    try {
      setError(null)
      await writeContract({
        address: FLIPSKI_V2_CONTRACT_ADDRESS,
        abi: FLIPSKI_V2_ABI,
        functionName: 'unpauseContract',
        args: [],
      })
    } catch (error) {
      setError(error.message)
    }
  }

  return {
    tokens,
    isLoading: isPending || isConfirming,
    error,
    hasAdminRole,
    hasTokenManagerRole,
    addToken,
    removeToken,
    updateTokenConfig,
    setTokenPaused,
    pauseContract,
    unpauseContract,
    refetchTokens,
  }
}