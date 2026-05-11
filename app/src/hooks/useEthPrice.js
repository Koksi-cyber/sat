import { useState, useEffect } from 'react';

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState(null);

  useEffect(() => {
    let ws;
    let isMounted = true;

    function connect() {
      // Connect to CoinCap's public stream for Ethereum
      // This is globally accessible and doesn't block US IPs like Binance does
      ws = new WebSocket('wss://ws.coincap.io/prices?assets=ethereum');

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          // CoinCap payload format: { "ethereum": "3000.50" }
          if (data && data.ethereum) {
            setEthPrice(parseFloat(data.ethereum));
          }
        } catch (err) {
          console.error("Error parsing ETH price data", err);
        }
      };

      ws.onerror = (error) => {
        console.error("ETH WebSocket Error: ", error);
      };

      ws.onclose = () => {
        // Reconnect after 3 seconds if disconnected
        if (isMounted) {
          setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return ethPrice;
}
