import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { TOKEN_ADDRESS, ROUTER_ADDRESS, TOKEN_ABI, ROUTER_ABI, POOL_KEY } from '../config/contracts';

export function TradeCard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('buy');
  const [amount, setAmount] = useState('');

  // Read Balances & Allowance
  const { data: ethBalanceData } = useBalance({ address });
  const { data: tokenBalanceData, refetch: refetchTokenBalance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address },
  });
  
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'allowance',
    args: [address, ROUTER_ADDRESS],
    query: { enabled: !!address },
  });

  // Write Contract
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract();
  
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isTxSuccess) {
      refetchTokenBalance();
      refetchAllowance();
      setAmount('');
    }
  }, [isTxSuccess, refetchTokenBalance, refetchAllowance]);

  const ethBalance = ethBalanceData ? formatEther(ethBalanceData.value) : '0';
  const tokenBalance = tokenBalanceData ? formatEther(tokenBalanceData) : '0';
  const parsedAmount = amount ? parseEther(amount) : 0n;
  const isApproved = allowanceData !== undefined && allowanceData >= parsedAmount;

  const handleApprove = () => {
    writeContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: 'approve',
      args: [ROUTER_ADDRESS, 115792089237316195423570985008687907853269984665640564039457584007913129639935n], // max uint256
    });
  };

  const handleBuy = () => {
    if (!amount || parsedAmount <= 0n) return;
    writeContract({
      address: ROUTER_ADDRESS,
      abi: ROUTER_ABI,
      functionName: 'buy',
      args: [POOL_KEY, address],
      value: parsedAmount,
    });
  };

  const handleSell = () => {
    if (!amount || parsedAmount <= 0n) return;
    writeContract({
      address: ROUTER_ADDRESS,
      abi: ROUTER_ABI,
      functionName: 'sell',
      args: [POOL_KEY, address, parsedAmount],
    });
  };

  const isPending = isWritePending || isTxConfirming;

  return (
    <div className="trade-card trade-interface">
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => { setActiveTab('buy'); setAmount(''); }}
        >
          Buy
        </div>
        <div 
          className={`tab ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => { setActiveTab('sell'); setAmount(''); }}
        >
          Sell
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">
          {activeTab === 'buy' ? 'Amount to Spend (ETH)' : 'Amount to Sell (BitSats)'}
        </label>
        <input 
          type="number"
          className="input-field"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!isConnected || isPending}
        />
      </div>
      
      {isConnected && (
        <div className="balance-text">
          Balance: {activeTab === 'buy' ? parseFloat(ethBalance).toFixed(4) : parseFloat(tokenBalance).toFixed(4)}
        </div>
      )}

      {!isConnected ? (
        <button className="btn" disabled>Connect Wallet to Trade</button>
      ) : activeTab === 'buy' ? (
        <button className="btn btn-buy" onClick={handleBuy} disabled={!amount || isPending}>
          {isPending ? <div className="loader"></div> : 'Buy BitSats'}
        </button>
      ) : (
        <>
          {!isApproved && parsedAmount > 0n ? (
            <button className="btn" onClick={handleApprove} disabled={isPending}>
              {isPending ? <div className="loader"></div> : 'Approve Router'}
            </button>
          ) : (
            <button className="btn btn-sell" onClick={handleSell} disabled={!amount || isPending}>
              {isPending ? <div className="loader"></div> : 'Sell BitSats'}
            </button>
          )}
        </>
      )}
      
      {isTxSuccess && <p className="text-success text-center mt-4 text-sm">Transaction Successful!</p>}
    </div>
  );
}
