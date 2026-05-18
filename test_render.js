const inspectKeys = async () => {
    try {
        console.log('🔄 Fetching masked environment keys from Render...');
        const response = await fetch('https://quan-ly-chung-cu.onrender.com/api/payos/inspect-keys');
        const text = await response.text();
        console.log(`📡 HTTP Status Code: ${response.status}`);
        console.log(`📬 Response Body: ${text}`);
    } catch (err) {
        console.error('❌ Connection error:', err.message);
    }
};

inspectKeys();
