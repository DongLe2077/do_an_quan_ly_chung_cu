const testWebhook = async () => {
    try {
        console.log('🔄 Pinging Render webhook endpoint with empty body...');
        const response = await fetch('https://quan-ly-chung-cu.onrender.com/api/payos/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        const text = await response.text();
        console.log(`📡 HTTP Status Code: ${response.status}`);
        console.log(`📬 Response Body: ${text}`);
    } catch (err) {
        console.error('❌ Connection error:', err.message);
    }
};

testWebhook();
