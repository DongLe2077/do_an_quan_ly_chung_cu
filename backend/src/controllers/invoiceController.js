const HoaDonModel = require('../models/invoiceModel');
const ChiSoDichVuModel = require('../models/serviceReadingModel');
const ResidentModel = require('../models/residentModel');
const PayOS = require('@payos/node');
const response = require('../utils/responseFormat');
const { parsePagination, isPaginated } = require('../utils/pagination');

const generateId = () => 'HD' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
const generateOrderCode = () => {
    const base = Date.now().toString().slice(-10);
    const suffix = Math.floor(10 + Math.random() * 90).toString();
    return Number(`${base}${suffix}`);
};

const getPayOS = () => {
    const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || 'f9787f9a-e5d7-4042-9632-20e454fe38c5';
    const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '0a596df3-4f9c-471f-b1a6-5be1a898c940';
    const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '55d5baf838f2182827f5e6e5eec6acb7371f7d9751fc7516125bdfa0f81a5b96';

    if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
        throw new Error('Thiếu cấu hình PayOS');
    }
    return new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
};

const HoaDonController = {
    getAll: async (req, res) => {
        try {
            if (isPaginated(req.query)) {
                const { page, limit, offset } = parsePagination(req.query);
                const search = req.query.search || '';
                const status = req.query.status || '';
                const [data, total] = await Promise.all([
                    HoaDonModel.getAllPaginated(limit, offset, search, status),
                    HoaDonModel.count(search, status)
                ]);
                return response.paginate(res, data, page, limit, total, 'Lấy danh sách hóa đơn thành công');
            }
            const data = await HoaDonModel.getAll();
            return response.success(res, data, 'Lấy danh sách hóa đơn thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await HoaDonModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy hóa đơn', 404);
            return response.success(res, data, 'Lấy thông tin hóa đơn thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByApartment: async (req, res) => {
        try {
            const { apartment_id } = req.params;
            const data = await HoaDonModel.getByApartment(apartment_id);
            return response.success(res, data, 'Lấy danh sách hóa đơn theo phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByTrangThai: async (req, res) => {
        try {
            const { status } = req.params;
            const data = await HoaDonModel.getByTrangThai(status);
            return response.success(res, data, 'Lấy danh sách hóa đơn theo trạng thái thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { invoice_id, apartment_id, billing_month, total_amount, status, due_date } = req.body;
            if (!apartment_id || !billing_month) return response.error(res, 'Mã phòng và tháng thu là bắt buộc', 400);

            const invoiceId = invoice_id || generateId();
            await HoaDonModel.create({
                invoice_id: invoiceId, apartment_id, billing_month,
                total_amount: total_amount || 0,
                status: status || 'Chưa thanh toán',
                due_date
            });
            return response.success(res, { invoice_id: invoiceId }, 'Tạo hóa đơn thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { total_amount, status, due_date } = req.body;

            const existing = await HoaDonModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy hóa đơn', 404);

            total_amount = total_amount !== undefined ? total_amount : existing.total_amount;
            status = status !== undefined ? status : existing.status;
            due_date = due_date !== undefined ? due_date : existing.due_date;

            await HoaDonModel.update(id, { total_amount, status, due_date });
            return response.success(res, null, 'Cập nhật hóa đơn thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    thanhToan: async (req, res) => {
        try {
            const { id } = req.params;
            const { payment_method, PhuongThuc } = req.body;
            const user = req.user;

            if (!user || user.role !== 'cudan') {
                return response.error(res, 'Chỉ cư dân được phép thanh toán', 403);
            }

            const resident = await ResidentModel.getByUser(user.user_id);
            if (!resident || !resident.apartment_id) {
                return response.error(res, 'Tài khoản cư dân chưa liên kết căn hộ', 403);
            }

            const existing = await HoaDonModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy hóa đơn', 404);
            if (existing.apartment_id !== resident.apartment_id) {
                return response.error(res, 'Bạn không có quyền thanh toán hóa đơn này', 403);
            }
            if (existing.status !== 'Chưa thanh toán') {
                return response.error(res, 'Hóa đơn không ở trạng thái chờ thanh toán', 400);
            }

            const finalMethod = payment_method || PhuongThuc || 'ChuyenKhoan';
            await HoaDonModel.updateTrangThai(id, 'Chờ xác nhận', finalMethod);
            return response.success(res, {
                invoice_id: id,
                payment_method: finalMethod,
                timestamp: new Date().toISOString(),
            }, 'Yêu cầu thanh toán đã được gửi. Vui lòng chờ xác nhận.');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    taoPayOS: async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;

            if (!user || user.role !== 'cudan') {
                return response.error(res, 'Chỉ cư dân được phép thanh toán', 403);
            }

            const resident = await ResidentModel.getByUser(user.user_id);
            if (!resident || !resident.apartment_id) {
                return response.error(res, 'Tài khoản cư dân chưa liên kết căn hộ', 403);
            }

            const existing = await HoaDonModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy hóa đơn', 404);
            if (existing.apartment_id !== resident.apartment_id) {
                return response.error(res, 'Bạn không có quyền thanh toán hóa đơn này', 403);
            }
            if (existing.status === 'Đã thanh toán') {
                return response.error(res, 'Hóa đơn đã được thanh toán', 400);
            }

            const amount = Math.round(Number(existing.total_amount || 0));
            if (amount <= 0) {
                return response.error(res, 'Hóa đơn không hợp lệ để thanh toán', 400);
            }

            const payos = getPayOS();
            const orderCode = generateOrderCode();

            // Tự động nhận diện domain của Frontend (localhost hoặc Vercel)
            const origin = req.headers.origin || req.headers.referer || 'http://localhost:3000';
            const baseOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;

            const returnUrl = process.env.PAYOS_RETURN_URL || `${baseOrigin}/invoices`;
            const cancelUrl = process.env.PAYOS_CANCEL_URL || `${baseOrigin}/invoices`;

            const paymentLink = await payos.createPaymentLink({
                orderCode,
                amount,
                description: `Thanh toan ${existing.invoice_id}`,
                returnUrl,
                cancelUrl
            });

            await HoaDonModel.setPaymentOrder(id, {
                orderCode,
                provider: 'PayOS',
                method: 'PayOS'
            });

            return response.success(res, {
                checkoutUrl: paymentLink.checkoutUrl,
                paymentLinkId: paymentLink.paymentLinkId,
                orderCode
            }, 'Tạo link thanh toán PayOS thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    payosWebhook: async (req, res) => {
        try {
            // Bỏ qua và xác nhận thành công nếu là request kiểm thử liên kết của PayOS (không có chữ ký signature)
            if (!req.body || !req.body.signature) {
                console.log('🔄 Nhận yêu cầu xác nhận/thăm dò Webhook từ PayOS:', req.body);
                return res.json({ error: 0, message: 'Webhook checked/registered successfully' });
            }

            const payos = getPayOS();
            const verified = payos.verifyPaymentWebhookData(req.body);

            const payload = verified?.data || verified;
            const code = verified?.code || req.body?.code;

            if (code && code !== '00') {
                return res.json({ error: 0, message: 'success' });
            }

            const orderCode = payload?.orderCode || payload?.order_code;
            if (!orderCode) return res.json({ error: 0, message: 'success' });

            const invoice = await HoaDonModel.getByPaymentOrderCode(orderCode);
            if (!invoice) return res.json({ error: 0, message: 'success' });

            if (invoice.status === 'Đã thanh toán') {
                return res.json({ error: 0, message: 'success' });
            }

            const amount = Number(payload?.amount || 0);
            if (amount && Number(invoice.total_amount) !== amount) {
                return res.status(400).json({ success: false, message: 'Sai số tiền thanh toán' });
            }

            await HoaDonModel.markPaidByOrderCode(orderCode, {
                paidAt: payload?.transactionDateTime ? new Date(payload.transactionDateTime) : new Date(),
                paymentRef: payload?.reference || payload?.paymentLinkId || null,
                provider: 'PayOS',
                method: 'PayOS'
            });

            return res.json({ error: 0, message: 'success' });
        } catch (error) {
            console.error('❌ Lỗi Webhook PayOS:', error);
            
            // Nếu có lỗi chữ ký nhưng đây không phải là một giao dịch thật trong database, 
            // chúng ta vẫn trả về success để PayOS có thể đăng ký Webhook thành công.
            try {
                const orderCode = req.body?.data?.orderCode || req.body?.data?.order_code;
                if (orderCode) {
                    const invoice = await HoaDonModel.getByPaymentOrderCode(orderCode);
                    if (!invoice) {
                        console.log(`⚠️ Bỏ qua lỗi chữ ký cho mã đơn hàng test không tồn tại: ${orderCode}`);
                        return res.json({ error: 0, message: 'success' });
                    }
                } else {
                    console.log('⚠️ Bỏ qua lỗi chữ ký cho request không có data/orderCode');
                    return res.json({ error: 0, message: 'success' });
                }
            } catch (innerErr) {
                console.error('❌ Lỗi kiểm tra database trong catch block:', innerErr);
            }

            return res.status(400).json({ success: false, message: `Webhook PayOS không hợp lệ: ${error.message || error}` });
        }
    },

    inspectKeys: (req, res) => {
        const mask = (key) => {
            if (!key) return 'MISSING';
            if (key.length <= 8) return 'SHORT_KEY';
            return `${key.slice(0, 4)}...${key.slice(-4)}`;
        };

        return res.json({
            PAYOS_CLIENT_ID: mask(process.env.PAYOS_CLIENT_ID),
            PAYOS_API_KEY: mask(process.env.PAYOS_API_KEY),
            PAYOS_CHECKSUM_KEY: mask(process.env.PAYOS_CHECKSUM_KEY),
            PAYOS_CLIENT_ID_FALLBACK: mask('f9787f9a-e5d7-4042-9632-20e454fe38c5'),
            PAYOS_API_KEY_FALLBACK: mask('0a596df3-4f9c-471f-b1a6-5be1a898c940'),
            PAYOS_CHECKSUM_KEY_FALLBACK: mask('55d5baf838f2182827f5e6e5eec6acb7371f7d9751fc7516125bdfa0f81a5b96')
        });
    },

    // Admin xác nhận thanh toán
    xacNhanThanhToan: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await HoaDonModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy hóa đơn', 404);
            if (existing.status !== 'Chờ xác nhận') {
                return response.error(res, 'Hóa đơn không ở trạng thái chờ xác nhận', 400);
            }
            await HoaDonModel.updateTrangThai(id, 'Đã thanh toán');
            return response.success(res, null, 'Đã xác nhận thanh toán thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Admin từ chối thanh toán
    tuChoiThanhToan: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await HoaDonModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy hóa đơn', 404);
            if (existing.status !== 'Chờ xác nhận') {
                return response.error(res, 'Hóa đơn không ở trạng thái chờ xác nhận', 400);
            }
            await HoaDonModel.updateTrangThai(id, 'Chưa thanh toán');
            return response.success(res, null, 'Đã từ chối thanh toán. Hóa đơn trở về trạng thái chưa thanh toán.');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    tinhTienTuDong: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await HoaDonModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy hóa đơn', 404);

            const total = await HoaDonModel.calculateAndUpdateTotal(id);

            return response.success(res, { total_amount: total }, 'Đã tính tổng tiền hóa đơn tự động thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await HoaDonModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy hóa đơn', 404);

            await HoaDonModel.delete(id);
            return response.success(res, null, 'Xóa hóa đơn thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = HoaDonController;
