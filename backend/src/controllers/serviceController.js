const DanhSachDichVuModel = require('../models/serviceModel');
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
            const { service_name, unit_price, unit, service_type } = req.body;
            if (!service_name) return response.error(res, 'Tên dịch vụ là bắt buộc', 400);

            const service_id = generateId();
            await DanhSachDichVuModel.create({ service_id, service_name, unit_price, unit, service_type });
            return response.success(res, { service_id }, 'Tạo dịch vụ thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { service_name, unit_price, unit, service_type } = req.body;

            const existing = await DanhSachDichVuModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy dịch vụ', 404);

            service_name = service_name !== undefined ? service_name : existing.service_name;
            unit_price = unit_price !== undefined ? unit_price : existing.unit_price;
            unit = unit !== undefined ? unit : existing.unit;
            service_type = service_type !== undefined ? service_type : existing.service_type;

            await DanhSachDichVuModel.update(id, { service_name, unit_price, unit, service_type });
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
