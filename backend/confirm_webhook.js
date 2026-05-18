require('dotenv').config();

const CLIENT_ID = process.env.PAYOS_CLIENT_ID || 'f9787f9a-e5d7-4042-9632-20e454fe38c5';
const API_KEY = process.env.PAYOS_API_KEY || '0a596df3-4f9c-471f-b1a6-5be1a898c940';
const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '55d5baf838f2182827f5e6e5eec6acb7371f7d9751fc7516125bdfa0f81a5b96';
const WEBHOOK_URL = 'https://quan-ly-chung-cu.onrender.com/api/payos/webhook';

const PayOS = require('@payos/node');
const payos = new PayOS(CLIENT_ID, API_KEY, CHECKSUM_KEY);

const confirmWebhook = async () => {
    try {
        console.log('🔄 Đang gửi yêu cầu đăng ký Webhook lên PayOS (sử dụng SDK)...');
        console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
        
        const result = await payos.confirmWebhook(WEBHOOK_URL);
        console.log('✅ Đăng ký Webhook thành công!');
        console.log('📬 Chi tiết phản hồi từ PayOS:', result);
    } catch (error) {
        console.error('❌ Đăng ký Webhook thất bại!');
        console.error('Chi tiết lỗi:', error.message || error);
    }
};

confirmWebhook();
