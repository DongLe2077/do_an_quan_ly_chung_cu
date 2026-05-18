const testWebhook = async () => {
    try {
        console.log('🔄 Pinging Render webhook with invalid signature but test orderCode...');
        const response = await fetch('https://quan-ly-chung-cu.onrender.com/api/payos/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                signature: 'invalid_signature_to_trigger_catch_block',
                data: {
                    orderCode: 999999 // A test code that doesn't exist in our db
                }
            })
        });
        
        const text = await response.text();
        console.log(`📡 HTTP Status Code: ${response.status}`);
        console.log(`📬 Response Body: ${text}`);
    } catch (err) {
        console.error('❌ Connection error:', err.message);
    }
};

testWebhook();
