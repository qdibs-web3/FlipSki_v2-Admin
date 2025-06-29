import { useAccount, useChainId } from 'wagmi'
import { base } from 'wagmi/chains'

export function useWalletConnection() {
  const { address, isConnected, isConnecting } = useAccount()
  const chainId = useChainId()

  const isCorrectNetwork = chainId === base.id

  return {
    address,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    chainId
  }
}