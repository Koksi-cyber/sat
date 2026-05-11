import React from 'react';
import { useTokenPrice } from '../hooks/useTokenPrice';
import { useEthPrice } from '../hooks/useEthPrice';

export function TokenPriceCard() {
  const { price, supply, reserve, fees, loading, error } = useTokenPrice();
  const ethPrice = useEthPrice();

  return (
    <div className="trade-card info-card price-card">
      <div className="price-card-header">
        <div className="price-card-dot" />
        <h3 className="text-sm font-extrabold" style={{ color: 'var(--accent)' }}>
          Live Analytics
        </h3>
      </div>

      {loading ? (
        <div className="price-loading">
          <div className="loader" />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fetching on-chain data…</span>
        </div>
      ) : error ? (
        <p className="text-sm" style={{ color: '#ef4444' }}>Error: {error}</p>
      ) : (
        <div className="price-grid">
          <div className="price-stat">
            <span className="price-stat-label">Live ETH Price</span>
            <span className="price-stat-value text-success">
              {typeof ethPrice === 'number' ? `$${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '...'}
            </span>
          </div>
          <div className="price-stat">
            <span className="price-stat-label">Token Price</span>
            <span className="price-stat-value text-market accent-glow">
              {price} <small>ETH</small>
              {typeof ethPrice === 'number' && price !== '—' && (
                <small style={{ marginLeft: '6px', color: 'var(--text-secondary)' }}>
                  (${ (parseFloat(price) * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) })
                </small>
              )}
            </span>
          </div>
          <div className="price-stat">
            <span className="price-stat-label">Total Minted (Fair)</span>
            <span className="price-stat-value">{supply}</span>
          </div>
          <div className="price-stat">
            <span className="price-stat-label">Curve Reserve</span>
            <span className="price-stat-value">{reserve} <small>ETH</small></span>
          </div>
          <div className="price-stat">
            <span className="price-stat-label">Fees Accrued</span>
            <span className="price-stat-value">{fees} <small>ETH</small></span>
          </div>
        </div>
      )}
    </div>
  );
}
