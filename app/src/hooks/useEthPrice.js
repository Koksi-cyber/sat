import { useState, useEffect } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http('https://base-mainnet.g.alchemy.com/v2/sjwwAR4WKLjP1b9yNfSBC'),
});

const CHAINLINK_ETH_USD_ADDRESS = '0x71041dddad3595F9CEd3Dc2bA56DC7012B65A3d1';
const CHAINLINK_ABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPrice() {
      try {
        // Fetching on-chain directly from the Chainlink Oracle.
        // This guarantees it will work because it bypasses all REST/WebSocket
        // domain blocks by routing through the exact same Alchemy RPC as the app!
        const data = await publicClient.readContract({
          address: CHAINLINK_ETH_USD_ADDRESS,
          abi: CHAINLINK_ABI,
          functionName: 'latestRoundData',
        });
        
        if (isMounted && data && typeof data[1] !== 'undefined' && data[1] !== null) {
          // Chainlink USD feeds always use 8 decimals
          const price = Number(formatUnits(data[1], 8));
          setEthPrice(price);
        }
      } catch (err) {
        console.error("Error fetching ETH price on-chain", err);
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); // refresh every 5 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return ethPrice;
}
