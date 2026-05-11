import { createPublicClient, fallback, http } from 'viem';
import { base } from 'viem/chains';

// Collection of Alchemy keys for rotation/fallback to prevent rate limits
const ALCHEMY_KEYS = [
  'sjwwAR4WKLjP1b9yNfSBC',
  '6DIF9XAwdGtFLzDvfemr7',
  '2dynRIMQ2FAo4HmgJp9FG',
];

const transports = ALCHEMY_KEYS.map(key => 
  http(`https://base-mainnet.g.alchemy.com/v2/${key}`)
);

// Final fallback to public RPC
transports.push(http());

export const publicClient = createPublicClient({
  chain: base,
  transport: fallback(transports),
});
