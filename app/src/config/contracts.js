export const TOKEN_ADDRESS = '0x7700D683731a860523437d3476842Fa08ED2C15e';
export const ROUTER_ADDRESS = '0x97137d335b29743E1b9434f8Cc594D50572dE5a7';
export const HOOK_ADDRESS = '0x638Bc807C2f740E7bCe47Fb59706905361CD6888';
export const NATIVE_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

export const POOL_KEY = {
  currency0: NATIVE_ETH_ADDRESS,
  currency1: TOKEN_ADDRESS,
  fee: 3000,
  tickSpacing: 60,
  hooks: HOOK_ADDRESS,
};

export const TOKEN_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

export const HOOK_ABI = [
  {
    "inputs": [],
    "name": "ethCum",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMintedFair",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "curveReserveEth",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feesAccrued",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "currency0", "type": "address" },
          { "internalType": "address", "name": "currency1", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "int24", "name": "tickSpacing", "type": "int24" },
          { "internalType": "address", "name": "hooks", "type": "address" }
        ],
        "internalType": "struct PoolKey",
        "name": "key",
        "type": "tuple"
      },
      { "internalType": "address", "name": "recipient", "type": "address" }
    ],
    "name": "buy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "currency0", "type": "address" },
          { "internalType": "address", "name": "currency1", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "int24", "name": "tickSpacing", "type": "int24" },
          { "internalType": "address", "name": "hooks", "type": "address" }
        ],
        "internalType": "struct PoolKey",
        "name": "key",
        "type": "tuple"
      },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" }
    ],
    "name": "sell",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
