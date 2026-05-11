import React from 'react'
import { Navbar } from './components/Navbar'
import { TradeCard } from './components/TradeCard'
import { TokenPriceCard } from './components/TokenPriceCard'
import { Sat0Dashboard } from './components/Sat0Dashboard'

function App() {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <aside className="info-sidebar">
          <TokenPriceCard />
          <div className="trade-card info-card">
            <h3 className="mb-2 text-sm font-extrabold" style={{ color: 'var(--accent)' }}>Protocol Mechanics</h3>
            <p className="text-sm protocol-text">
              The contract is trustless and permissionless. Every buy mints new tokens. 
              Every sell burns them permanently. Max supply is capped at 999,000, with a 200 ETH reserve pool. 
              The scarcer it gets, the stronger it burns.
            </p>
          </div>
        </aside>
        
        <main className="trade-main">
          <h1 className="text-center mb-2 font-extrabold">
            Trade BitSats
          </h1>
          <p className="text-center mb-8">
            Seamlessly exchange ETH and BitSats on Base
          </p>
          <TradeCard />
        </main>
      </div>

      <Sat0Dashboard />
    </>
  )
}

export default App
