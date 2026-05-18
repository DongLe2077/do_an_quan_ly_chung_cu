const HoaDonModel = require('../models/invoiceModel');
const ChiSoDichVuModel = require('../models/serviceReadingModel');
const ResidentModel = require('../models/residentModel');
const response = require('../utils/responseFormat');
const { parsePagination, isPaginated } = require('../utils/pagination');

const generateId = () => 'HD' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

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
