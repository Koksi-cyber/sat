import { useEffect, useState, useCallback } from 'react';
import { createPublicClient, http, formatEther, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { HOOK_ADDRESS, HOOK_ABI } from '../config/contracts';

// Alchemy RPC — same keys already used in Providers.jsx
const ALCHEMY_RPC = 'https://base-mainnet.g.alchemy.com/v2/sjwwAR4WKLjP1b9yNfSBC';

// Bonding-curve constants (from the contract math)
const K = 1_000_000;
const S = 33.333333333333333333;

/**
 * quoteSell — mirrors the Solidity fixed-point maths.
 * Returns how much ETH you'd receive for selling `tokenIn` tokens
 * at the current `currentTotal` supply level.
 */
function quoteSell(currentTotal, tokenIn) {
  if (tokenIn > currentTotal) {
    throw new Error('Sell exceeds current supply');
  }
  return (
    S *
    Math.log(
      (K - currentTotal + tokenIn) /
      (K - currentTotal)
    )
  );
}

// Standalone viem client — no wallet needed, read-only
const publicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_RPC),
});

export function useTokenPrice() {
  const [price, setPrice] = useState('—');
  const [supply, setSupply] = useState('—');
  const [reserve, setReserve] = useState('—');
  const [fees, setFees] = useState('—');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      // Multicall all three reads in a single RPC round-trip
      const results = await publicClient.multicall({
        contracts: [
          {
            address: HOOK_ADDRESS,
            abi: HOOK_ABI,
            functionName: 'totalMintedFair',
          },
          {
            address: HOOK_ADDRESS,
            abi: HOOK_ABI,
            functionName: 'curveReserveEth',
          },
          {
            address: HOOK_ADDRESS,
            abi: HOOK_ABI,
            functionName: 'feesAccrued',
          },
        ],
      });

      const totalMintedFair = results[0].result;
      const reserveEth = results[1].result;
      const feesAccrued = results[2].result;

      // Convert from wei → human-readable
      const supplyReadable = Number(formatUnits(totalMintedFair, 18));
      const reserveReadable = Number(formatEther(reserveEth));
      const feesReadable = Number(formatEther(feesAccrued));

      // Spot price = ETH received for selling 1 token at current supply
      const tokenPriceEth = quoteSell(supplyReadable, 1);

      setPrice(tokenPriceEth.toFixed(12));
      setSupply(supplyReadable.toLocaleString());
      setReserve(reserveReadable.toFixed(4));
      setFees(feesReadable.toFixed(4));
      setError(null);
    } catch (err) {
      console.error('useTokenPrice error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000); // refresh every 1s
    return () => clearInterval(interval);
  }, [loadData]);

  return { price, supply, reserve, fees, loading, error };
}
