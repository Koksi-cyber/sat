import { useEffect, useMemo, useState } from "react";
import { formatEther, formatUnits, createPublicClient, http } from "viem";
import { base } from "viem/chains";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { HOOK_ADDRESS, HOOK_ABI } from "../config/contracts";
import { useEthPrice } from "../hooks/useEthPrice";

// ======================================================
// CURVE CONSTANTS
// ======================================================

const K = 1_000_000;
const S = 33.333333333333333333;
const K_SUPPLY = 1_000_000;

// ======================================================
// CURVE MATH
// ======================================================

function totalMinted(eth) {
  return K * (1 - Math.exp(-eth / S));
}

function quoteSell(currentTotal, tokenIn) {
  if (tokenIn > currentTotal) {
    return 0;
  }

  return (
    S *
    Math.log(
      (K - currentTotal + tokenIn) /
        (K - currentTotal)
    )
  );
}

function spotPrice(currentTotal) {
  return S / (K - currentTotal);
}

// Standalone viem client — no wallet needed, read-only
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://base-mainnet.g.alchemy.com/v2/sjwwAR4WKLjP1b9yNfSBC'), // Using the Alchemy RPC for consistency
});

// ======================================================
// MAIN COMPONENT
// ======================================================

export function Sat0Dashboard() {
  const ethPrice = useEthPrice();
  const [stats, setStats] = useState({
    supply: 0,
    reserveEth: 0,
    fees: 0,
    ethCum: 0,
    burnPrice: 0,
    mintPrice: 0,
    drift: 0,
    marketCapEth: 0,
    fdvEth: 0,
    backingPerToken: 0,
    completion: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        // ============================================
        // FETCH ONCHAIN DATA WITH MULTICALL
        // ============================================

        const results = await publicClient.multicall({
          contracts: [
            {
              address: HOOK_ADDRESS,
              abi: HOOK_ABI,
              functionName: 'ethCum',
            },
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

        const ethCumRaw = results[0].result;
        const supplyRaw = results[1].result;
        const reserveRaw = results[2].result;
        const feesRaw = results[3].result;

        const ethCum = Number(formatEther(ethCumRaw));
        const supply = Number(formatUnits(supplyRaw, 18));
        const reserveEth = Number(formatEther(reserveRaw));
        const fees = Number(formatEther(feesRaw));

        // ============================================
        // CURVE PRICING
        // ============================================

        const burnPrice = quoteSell(supply, 1);
        const mintPrice = spotPrice(supply);

        // ============================================
        // MARKET CAP
        // ============================================

        const marketCapEth = burnPrice * supply;
        const fdvEth = burnPrice * K;

        // ============================================
        // OTHER METRICS
        // ============================================

        const forwardSupply = totalMinted(ethCum);
        const drift = supply - forwardSupply;
        const backingPerToken = reserveEth / supply;
        const completion = (supply / K_SUPPLY) * 100;

        setStats({
          supply,
          reserveEth,
          fees,
          ethCum,
          burnPrice,
          mintPrice,
          drift,
          marketCapEth,
          fdvEth,
          backingPerToken,
          completion,
        });
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  // ======================================================
  // CHART DATA
  // ======================================================

  const chartData = useMemo(() => {
    const arr = [];

    for (let eth = 0; eth <= 3000; eth += 20) {
      const supply = totalMinted(eth);
      const price = (S / K) * Math.exp(eth / S);

      arr.push({
        eth,
        supply,
        price,
      });
    }

    return arr;
  }, []);

  return (
    <div className="dashboard-container">
      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <h2 className="dashboard-title">
        Sat0 Dashboard
      </h2>

      {/* ========================================= */}
      {/* METRICS GRID */}
      {/* ========================================= */}

      <div className="metrics-grid">
        <MetricCard
          title="Market Cap"
          value={
            <>
              {(stats.marketCapEth || 0).toFixed(2)} ETH
              {ethPrice && stats.marketCapEth > 0 && (
                <small style={{ marginLeft: '6px', color: 'var(--text-secondary)', fontSize: '0.7em' }}>
                  (${((stats.marketCapEth || 0) * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </small>
              )}
            </>
          }
        />

        {/* FDV Removed as requested */}

        <MetricCard
          title="Circulating Supply"
          value={(stats.supply || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        />

        <MetricCard
          title="Curve Reserve"
          value={`${(stats.reserveEth || 0).toFixed(4)} ETH`}
        />

        <MetricCard
          title="Fees Accrued"
          value={`${(stats.fees || 0).toFixed(4)} ETH`}
        />

        <MetricCard
          title="ETH Cumulative"
          value={`${(stats.ethCum || 0).toFixed(2)} ETH`}
        />

        <MetricCard
          title="Backing Per Token"
          value={`${(stats.backingPerToken || 0).toFixed(10)} ETH`}
        />

        <MetricCard
          title="Curve Completion"
          value={`${(stats.completion || 0).toFixed(2)}%`}
        />

        <MetricCard
          title="Burn Price"
          value={
            <>
              {(stats.burnPrice || 0).toFixed(10)} ETH
              {ethPrice && stats.burnPrice > 0 && (
                <small style={{ marginLeft: '6px', color: 'var(--text-secondary)', fontSize: '0.7em' }}>
                  (${((stats.burnPrice || 0) * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })})
                </small>
              )}
            </>
          }
          valueClassName="text-burn"
        />

        <MetricCard
          title="Mint Price"
          value={
            <>
              {(stats.mintPrice || 0).toFixed(10)} ETH
              {ethPrice && stats.mintPrice > 0 && (
                <small style={{ marginLeft: '6px', color: 'var(--text-secondary)', fontSize: '0.7em' }}>
                  (${((stats.mintPrice || 0) * ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })})
                </small>
              )}
            </>
          }
          valueClassName="text-mint"
        />

        {/* 
        <MetricCard
          title="Curve Drift"
          value={(stats.drift || 0).toFixed(2)}
          valueClassName="text-burn"
        />
        */}
      </div>

      {/* ========================================= */}
      {/* CURVE GRAPH (COMMENTED OUT) */}
      {/* ========================================= */}

      {/*
      <div className="trade-card chart-card">
        <h3 className="chart-title">
          Bonding Curve
        </h3>

        <div style={{ height: 550, width: '100%', marginTop: '20px' }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="var(--card-border)" strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="eth"
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--card-border)' }}
                axisLine={{ stroke: 'var(--card-border)' }}
                tickFormatter={(value) => `${value} ETH`}
              />

              <YAxis
                yAxisId="left"
                stroke="var(--green)"
                tick={{ fill: 'var(--green)' }}
                tickLine={{ stroke: 'var(--card-border)' }}
                axisLine={{ stroke: 'var(--card-border)' }}
                tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(0)}k` : value}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--yellow)"
                tick={{ fill: 'var(--yellow)' }}
                tickLine={{ stroke: 'var(--card-border)' }}
                axisLine={{ stroke: 'var(--card-border)' }}
                tickFormatter={(value) => value.toFixed(5)}
              />

              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="supply"
                name="Supply"
                stroke="var(--green)"
                fill="var(--green)"
                fillOpacity={0.1}
                strokeWidth={2}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="price"
                name="Price (ETH)"
                stroke="var(--yellow)"
                dot={false}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      */}
    </div>
  );
}

// ======================================================
// METRIC CARD
// ======================================================

function MetricCard({ title, value, valueClassName = "" }) {
  return (
    <div className="trade-card metric-card">
      <div className="metric-card-title">
        {title}
      </div>
      <div className={`metric-card-value ${valueClassName}`}>
        {value}
      </div>
    </div>
  );
}
