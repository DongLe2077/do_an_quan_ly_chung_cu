const { PayOS } = require('@payos/node');

try {
    const payos = new PayOS('dummy_id', 'dummy_key', 'dummy_checksum');
    console.log('📌 PayOS Instance methods:');
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(payos)));
    
    if (payos.webhooks) {
        console.log('📌 payos.webhooks methods:');
        console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(payos.webhooks)));
    }
} catch (err) {
    console.error('Error:', err.message);
}
