async function testConnectivity() {
  try {
    console.log('Testing connectivity to google.com...');
    const res = await fetch('https://www.google.com');
    console.log('Google connectivity check: OK', res.status);
    
    console.log('Testing connectivity to api.binance.com...');
    const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
    const data = await binanceRes.json();
    console.log('Binance connectivity check: OK', binanceRes.status, data);
  } catch (error) {
    console.error('Detailed Error:', error);
  }
}

testConnectivity();
