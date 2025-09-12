const axios = require('axios');

async function testCorrectEndpoint() {
  const date = '20241206';
  const url = `https://cdn.finra.org/equity/regsho/daily/CNMSshvol${date}.txt`;
  
  console.log('Testing:', url);
  
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('✅ Success! Response size:', response.data.length);
    
    // Show first few lines
    const lines = response.data.split('\n');
    console.log('First 3 lines:');
    lines.slice(0, 3).forEach((line, i) => console.log(`${i+1}: ${line}`));
    
    // Count total records
    const recordCount = lines.length - 1; // Exclude header
    console.log('Total records:', recordCount);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status || error.message);
    if (error.response?.status === 404) {
      console.log('File not found - try a different date');
    }
  }
}

testCorrectEndpoint();