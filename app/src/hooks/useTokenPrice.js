import { useEffect, useState, useCallback } from 'react';
import { createPublicClient, http, formatEther, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { HOOK_ADDRESS, HOOK_ABI } from '../config/contracts';
import { publicClient } from '../config/rpc';

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

      const totalMintedFair = results?.[0]?.status === 'success' ? results[0].result : 0n;
      const reserveEth = results?.[1]?.status === 'success' ? results[1].result : 0n;
      const feesAccrued = results?.[2]?.status === 'success' ? results[2].result : 0n;

      // Convert from wei → human-readable
      // formatUnits/formatEther throw if passed undefined/null, so we default to 0n
      const supplyReadable = Number(formatUnits(totalMintedFair || 0n, 18));
      const reserveReadable = Number(formatEther(reserveEth || 0n));
      const feesReadable = Number(formatEther(feesAccrued || 0n));

      // Spot price = ETH received for selling 1 token at current supply
      // We handle the 0 supply case by returning a base price or 0
      let tokenPriceEth = 0;
      if (supplyReadable >= 1) {
        tokenPriceEth = quoteSell(supplyReadable, 1);
      }

      setPrice(tokenPriceEth.toFixed(12));
      setSupply(supplyReadable.toLocaleString());
      setReserve(reserveReadable.toFixed(4));
      setFees(feesReadable.toFixed(4));
      setError(null);
    } catch (err) {
      console.error('useTokenPrice error:', err);
      setError(err.message || 'Unknown data fetch error');
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
