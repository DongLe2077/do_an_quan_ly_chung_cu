const ThongTinCuDanModel = require('../models/cuDanModel');
const response = require('../utils/responseFormat');

const generateId = () => 'CD' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

const ThongTinCuDanController = {
    getAll: async (req, res) => {
        try {
            const data = await ThongTinCuDanModel.getAll();
            return response.success(res, data, 'Lấy danh sách cư dân thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await ThongTinCuDanModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy cư dân', 404);
            return response.success(res, data, 'Lấy thông tin cư dân thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByPhong: async (req, res) => {
        try {
            const { MaPhong } = req.params;
            const data = await ThongTinCuDanModel.getByPhong(MaPhong);
            return response.success(res, data, 'Lấy danh sách cư dân theo phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByNguoiDung: async (req, res) => {
        try {
            const { MaNguoiDung } = req.params;
            const data = await ThongTinCuDanModel.getByNguoiDung(MaNguoiDung);
            if (!data) return response.error(res, 'Không tìm thấy thông tin cư dân', 404);
            return response.success(res, data, 'Lấy thông tin cư dân theo người dùng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { CCCD, HoTen, SoDienThoai, QueQuan, MaPhong, MaNguoiDung } = req.body;
            if (!HoTen) return response.error(res, 'Họ tên là bắt buộc', 400);

            const MaCuDan = generateId();
            await ThongTinCuDanModel.create({ MaCuDan, HoTen, SoDienThoai, CCCD, QueQuan, MaPhong, MaNguoiDung });
            return response.success(res, { MaCuDan }, 'Tạo cư dân thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { HoTen, SoDienThoai, CCCD, QueQuan, MaPhong, MaNguoiDung } = req.body;

            const existing = await ThongTinCuDanModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy cư dân', 404);

            HoTen = HoTen !== undefined ? HoTen : existing.HoTen;
            SoDienThoai = SoDienThoai !== undefined ? SoDienThoai : existing.SoDienThoai;
            CCCD = CCCD !== undefined ? CCCD : existing.CCCD;
            QueQuan = QueQuan !== undefined ? QueQuan : existing.QueQuan;
            MaPhong = MaPhong !== undefined ? MaPhong : existing.MaPhong;
            MaNguoiDung = MaNguoiDung !== undefined ? MaNguoiDung : existing.MaNguoiDung;

            await ThongTinCuDanModel.update(id, { HoTen, SoDienThoai, CCCD, QueQuan, MaPhong, MaNguoiDung });
            return response.success(res, null, 'Cập nhật cư dân thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await ThongTinCuDanModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy cư dân', 404);

            await ThongTinCuDanModel.delete(id);
            return response.success(res, null, 'Xóa cư dân thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = ThongTinCuDanController;
