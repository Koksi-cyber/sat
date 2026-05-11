async function fetchEthPrice() {
  const api = {
    name: 'Coinbase',
    url: 'https://api.coinbase.com/v2/prices/ETH-USD/spot',
    parser: (data) => data.data.amount
  };

  try {
    const response = await fetch(api.url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      console.log(`[${api.name}] HTTP Error: ${response.status} ${response.statusText}`);
      return;
    }
    const data = await response.json();
    console.log(`[${new Date().toLocaleTimeString()}] ETH Price: $${api.parser(data)}`);
  } catch (error) {
    console.log(`[${new Date().toLocaleTimeString()}] Error:`, error.message);
    if (error.cause) {
      console.log('  Cause:', error.cause.message || error.cause);
    }
  }
}

console.log('Debugging ETH Price Tracker (Detailed Error logging)...');
setInterval(fetchEthPrice, 1000);
fetchEthPrice();
