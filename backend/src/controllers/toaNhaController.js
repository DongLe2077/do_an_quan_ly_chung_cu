const ToaNhaModel = require('../models/toaNhaModel');
const response = require('../utils/responseFormat');

const generateId = () => 'TN' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(-3).toUpperCase();

const ToaNhaController = {
    getAll: async (req, res) => {
        try {
            const data = await ToaNhaModel.getAll();
            return response.success(res, data, 'Lấy danh sách tòa nhà thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await ToaNhaModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy tòa nhà', 404);
            return response.success(res, data, 'Lấy thông tin tòa nhà thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { TenToaNha, SoLuongPhong } = req.body;
            if (!TenToaNha) return response.error(res, 'Tên tòa nhà là bắt buộc', 400);

            const MaToaNha = generateId();
            await ToaNhaModel.create({ MaToaNha, TenToaNha, SoLuongPhong: SoLuongPhong || 0 });
            return response.success(res, { MaToaNha }, 'Tạo tòa nhà thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { TenToaNha, SoLuongPhong } = req.body;

            const existing = await ToaNhaModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy tòa nhà', 404);

            await ToaNhaModel.update(id, {
                TenToaNha: TenToaNha || existing.TenToaNha,
                SoLuongPhong: SoLuongPhong !== undefined ? SoLuongPhong : existing.SoLuongPhong
            });
            return response.success(res, null, 'Cập nhật tòa nhà thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await ToaNhaModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy tòa nhà', 404);

            await ToaNhaModel.delete(id);
            return response.success(res, null, 'Xóa tòa nhà thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = ToaNhaController;
