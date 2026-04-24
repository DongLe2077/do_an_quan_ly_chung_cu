const HoaDonModel = require('../models/hoaDonModel');
const ChiSoDichVuModel = require('../models/chiSoDichVuModel');
const response = require('../utils/responseFormat');

const generateId = () => 'HD' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

const HoaDonController = {
    getAll: async (req, res) => {
        try {
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

    getByPhong: async (req, res) => {
        try {
            const { MaPhong } = req.params;
            const data = await HoaDonModel.getByPhong(MaPhong);
            return response.success(res, data, 'Lấy danh sách hóa đơn theo phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByTrangThai: async (req, res) => {
        try {
            const { TrangThai } = req.params;
            const data = await HoaDonModel.getByTrangThai(TrangThai);
            return response.success(res, data, 'Lấy danh sách hóa đơn theo trạng thái thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { MaHoaDon, MaPhong, ThangThu, TongTien, TrangThai, HanDongTien } = req.body;
            if (!MaPhong || !ThangThu) return response.error(res, 'Mã phòng và tháng thu là bắt buộc', 400);

            const maHoaDon = MaHoaDon || generateId();
            await HoaDonModel.create({
                MaHoaDon: maHoaDon, MaPhong, ThangThu,
                TongTien: TongTien || 0,
                TrangThai: TrangThai || 'Chưa thanh toán',
                HanDongTien
            });
            return response.success(res, { MaHoaDon: maHoaDon }, 'Tạo hóa đơn thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { TongTien, TrangThai, HanDongTien } = req.body;

            const existing = await HoaDonModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy hóa đơn', 404);

            TongTien = TongTien !== undefined ? TongTien : existing.TongTien;
            TrangThai = TrangThai !== undefined ? TrangThai : existing.TrangThai;
            HanDongTien = HanDongTien !== undefined ? HanDongTien : existing.HanDongTien;

            await HoaDonModel.update(id, { TongTien, TrangThai, HanDongTien });
            return response.success(res, null, 'Cập nhật hóa đơn thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    thanhToan: async (req, res) => {
        try {
            const { id } = req.params;
            const { PhuongThuc } = req.body;
            const existing = await HoaDonModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy hóa đơn', 404);
            if (existing.TrangThai !== 'Chưa thanh toán') {
                return response.error(res, 'Hóa đơn không ở trạng thái chờ thanh toán', 400);
            }

            await HoaDonModel.updateTrangThai(id, 'Chờ xác nhận');
            return response.success(res, {
                MaHoaDon: id,
                PhuongThuc: PhuongThuc || 'ChuyenKhoan',
                ThoiGian: new Date().toISOString(),
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
            if (existing.TrangThai !== 'Chờ xác nhận') {
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
            if (existing.TrangThai !== 'Chờ xác nhận') {
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

            return response.success(res, { TongTien: total }, 'Đã tính tổng tiền hóa đơn tự động thành công');
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
