const DanhSachDichVuModel = require('../models/danhSachDichVuModel');
const response = require('../utils/responseFormat');

const generateId = () => 'DV' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

const DanhSachDichVuController = {
    getAll: async (req, res) => {
        try {
            const data = await DanhSachDichVuModel.getAll();
            return response.success(res, data, 'Lấy danh sách dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await DanhSachDichVuModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy dịch vụ', 404);
            return response.success(res, data, 'Lấy thông tin dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { TenDichVu, DonGia, DonViTinh, LoaiDichVu } = req.body;
            if (!TenDichVu) return response.error(res, 'Tên dịch vụ là bắt buộc', 400);

            const MaDichVu = generateId();
            await DanhSachDichVuModel.create({ MaDichVu, TenDichVu, DonGia: DonGia || 0, DonViTinh, LoaiDichVu });
            return response.success(res, { MaDichVu }, 'Tạo dịch vụ thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { TenDichVu, DonGia, DonViTinh, LoaiDichVu } = req.body;

            const existing = await DanhSachDichVuModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy dịch vụ', 404);

            TenDichVu = TenDichVu !== undefined ? TenDichVu : existing.TenDichVu;
            DonGia = DonGia !== undefined ? DonGia : existing.DonGia;
            DonViTinh = DonViTinh !== undefined ? DonViTinh : existing.DonViTinh;
            LoaiDichVu = LoaiDichVu !== undefined ? LoaiDichVu : existing.LoaiDichVu;

            await DanhSachDichVuModel.update(id, { TenDichVu, DonGia, DonViTinh, LoaiDichVu });
            return response.success(res, null, 'Cập nhật dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await DanhSachDichVuModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy dịch vụ', 404);

            await DanhSachDichVuModel.delete(id);
            return response.success(res, null, 'Xóa dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = DanhSachDichVuController;
