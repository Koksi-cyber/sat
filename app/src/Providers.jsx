import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { base } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fallback, http } from 'viem'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Project ID from https://dashboard.reown.com
const projectId = 'a06edb8209a65c70e6a0ea78440d2387'

// 2. App metadata — shown in mobile wallet connection prompts
const metadata = {
  name: 'BitSats',
  description: 'Trade BitSats tokens on Base network',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://bitsats.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [base]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
  transports: {
    [base.id]: fallback([
      http('https://base-mainnet.g.alchemy.com/v2/sjwwAR4WKLjP1b9yNfSBC'),
      http('https://base-mainnet.g.alchemy.com/v2/6DIF9XAwdGtFLzDvfemr7'),
      http('https://base-mainnet.g.alchemy.com/v2/2dynRIMQ2FAo4HmgJp9FG'),
      http() // default public rpc as final fallback
    ])
  }
})

// 5. Create AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#4f46e5',
    '--w3m-border-radius-master': '2px'
  }
})

export function Providers({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
