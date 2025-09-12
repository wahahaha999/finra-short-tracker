const DataService = require('./dataService');
const dataService = new DataService();

async function demoFetch() {
  console.log('🚀 FINRA Data Fetcher Demo');
  console.log('=========================');
  console.log('');

  // Test with a known working date (December 6, 2024)
  const testDate = new Date('2024-12-06');
  const dateStr = testDate.toISOString().split('T')[0];
  
  console.log('📅 Testing with:', dateStr);
  console.log('');

  try {
    console.log('📊 Fetching data...');
    const data = await dataService.downloadDailyData(testDate);
    
    console.log('✅ Success!');
    console.log('📈 Total records:', data.length);
    console.log('');

    if (data.length > 0) {
      // Show top 5 by short volume
      console.log('🏆 Top 5 by Short Volume:');
      const top5 = data
        .sort((a, b) => b.shortVolume - a.shortVolume)
        .slice(0, 5);

      top5.forEach((item, index) => {
        const ratio = item.totalVolume > 0 ? 
          ((item.shortVolume / item.totalVolume) * 100).toFixed(1) : '0.0';
        console.log(`${index + 1}. ${item.symbol.padEnd(6)}: ${item.shortVolume.toLocaleString().padStart(10)} / ${item.totalVolume.toLocaleString().padStart(10)} (${ratio}%)`);
      });

      console.log('');
      console.log('📋 Sample entries:');
      data.slice(0, 3).forEach(item => {
        const ratio = item.totalVolume > 0 ? 
          ((item.shortVolume / item.totalVolume) * 100).toFixed(1) : '0.0';
        console.log(`${item.symbol} | Short: ${item.shortVolume.toLocaleString()} | Total: ${item.totalVolume.toLocaleString()} | Ratio: ${ratio}% | Market: ${item.market}`);
      });
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('');
    console.log('💡 This might be because:');
    console.log('   - The date is too recent');
    console.log('   - Data hasn\'t been published yet');
    console.log('   - Weekend/holiday with no trading');
  }
}

demoFetch();