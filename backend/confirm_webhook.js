require('dotenv').config();

const CLIENT_ID = process.env.PAYOS_CLIENT_ID || 'f9787f9a-e5d7-4042-9632-20e454fe38c5';
const API_KEY = process.env.PAYOS_API_KEY || '0a596df3-4f9c-471f-b1a6-5be1a898c940';
const WEBHOOK_URL = 'https://quan-ly-chung-cu.onrender.com/api/payos/webhook';

const confirmWebhook = async () => {
    try {
        console.log('🔄 Đang gửi yêu cầu đăng ký Webhook lên PayOS...');
        console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
        
        const response = await fetch('https://api-merchant.payos.vn/confirm-webhook', {
            method: 'POST',
            headers: {
                'x-client-id': CLIENT_ID,
                'x-api-key': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ webhookUrl: WEBHOOK_URL })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Đăng ký Webhook thành công!');
            console.log('📬 Chi tiết phản hồi từ PayOS:', data);
        } else {
            console.error('❌ Đăng ký Webhook thất bại!');
            console.error('Lỗi từ PayOS:', data);
        }
    } catch (error) {
        console.error('❌ Đăng ký Webhook thất bại!');
        console.error('Lỗi kết nối:', error.message);
    }
};

confirmWebhook();
