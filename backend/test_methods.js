const PayOS = require('@payos/node');

try {
    const payos = new PayOS('dummy_id', 'dummy_key', 'dummy_checksum');
    console.log('📌 PayOS Instance methods:');
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(payos)));
    
    console.log('📌 typeof payos.confirmWebhook:');
    console.log(typeof payos.confirmWebhook);
} catch (err) {
    console.error('Error:', err.message);
}
