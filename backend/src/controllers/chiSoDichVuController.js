const ChiSoDichVuModel = require('../models/chiSoDichVuModel');
const HoaDonModel = require('../models/hoaDonModel');
const response = require('../utils/responseFormat');

const generateId = () => 'CS' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

const ChiSoDichVuController = {
    getAll: async (req, res) => {
        try {
            const data = await ChiSoDichVuModel.getAll();
            return response.success(res, data, 'Lấy danh sách chỉ số dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await ChiSoDichVuModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy chỉ số dịch vụ', 404);
            return response.success(res, data, 'Lấy thông tin chỉ số dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByHoaDon: async (req, res) => {
        try {
            const { MaHoaDon } = req.params;
            const data = await ChiSoDichVuModel.getByHoaDon(MaHoaDon);
            return response.success(res, data, 'Lấy danh sách chỉ số theo hóa đơn thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByNgayGhi: async (req, res) => {
        try {
            const { NgayGhi } = req.params;
            const data = await ChiSoDichVuModel.getByNgayGhi(NgayGhi);
            return response.success(res, data, 'Lấy danh sách chỉ số theo ngày ghi thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            let { MaDichVu, MaHoaDon, ChiSoLanGhiTruoc, ChiSoHienTai, SoLuong, NgayGhi } = req.body;
            if (!MaDichVu) return response.error(res, 'Mã dịch vụ là bắt buộc', 400);

            // Tự động tính SoLuong nếu có chỉ số trước/sau
            if (ChiSoHienTai !== undefined && ChiSoLanGhiTruoc !== undefined) {
                SoLuong = ChiSoHienTai - ChiSoLanGhiTruoc;
            }

            const MaGhi = generateId();
            await ChiSoDichVuModel.create({
                MaGhi, MaDichVu, MaHoaDon,
                ChiSoLanGhiTruoc, ChiSoHienTai, SoLuong, NgayGhi
            });

            // Tự động tính lại tổng tiền hoá đơn nếu có MaHoaDon
            if (MaHoaDon) {
                await HoaDonModel.calculateAndUpdateTotal(MaHoaDon);
            }

            return response.success(res, { MaGhi }, 'Tạo chỉ số dịch vụ thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { MaDichVu, MaHoaDon, ChiSoLanGhiTruoc, ChiSoHienTai, SoLuong, NgayGhi } = req.body;

            const existing = await ChiSoDichVuModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy chỉ số dịch vụ', 404);

            // Cập nhật giá trị mới nhất để tính SoLuong
            const finalTruoc = ChiSoLanGhiTruoc !== undefined ? ChiSoLanGhiTruoc : existing.ChiSoLanGhiTruoc;
            const finalSau = ChiSoHienTai !== undefined ? ChiSoHienTai : existing.ChiSoHienTai;

            if (finalSau !== null && finalTruoc !== null) {
                SoLuong = finalSau - finalTruoc;
            }

            await ChiSoDichVuModel.update(id, {
                MaDichVu: MaDichVu || existing.MaDichVu,
                MaHoaDon: MaHoaDon !== undefined ? MaHoaDon : existing.MaHoaDon,
                ChiSoLanGhiTruoc: finalTruoc,
                ChiSoHienTai: finalSau,
                SoLuong: SoLuong !== undefined ? SoLuong : existing.SoLuong,
                NgayGhi: NgayGhi || existing.NgayGhi
            });

            // Tự động tính lại tổng tiền cho hoá đơn cũ và hoá đơn mới (nếu có đổi MaHoaDon)
            if (existing.MaHoaDon) await HoaDonModel.calculateAndUpdateTotal(existing.MaHoaDon);
            if (MaHoaDon && MaHoaDon !== existing.MaHoaDon) await HoaDonModel.calculateAndUpdateTotal(MaHoaDon);

            return response.success(res, null, 'Cập nhật chỉ số dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await ChiSoDichVuModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy chỉ số dịch vụ', 404);

            await ChiSoDichVuModel.delete(id);

            // Tự động tính lại tổng tiền hoá đơn sau khi xoá
            if (existing.MaHoaDon) {
                await HoaDonModel.calculateAndUpdateTotal(existing.MaHoaDon);
            }

            return response.success(res, null, 'Xóa chỉ số dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = ChiSoDichVuController;
