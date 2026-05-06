const ToaNhaModel = require('../models/buildingModel');
const response = require('../utils/responseFormat');

const generateId = () => 'TN' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

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
            const { building_name, max_apartments } = req.body;
            if (!building_name) return response.error(res, 'Tên tòa nhà là bắt buộc', 400);

            const building_id = generateId();
            await ToaNhaModel.create({ building_id, building_name, max_apartments });
            return response.success(res, { building_id }, 'Tạo tòa nhà thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { building_name, max_apartments } = req.body;

            const existing = await ToaNhaModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy tòa nhà', 404);

            building_name = building_name !== undefined ? building_name : existing.building_name;
            max_apartments = max_apartments !== undefined ? max_apartments : existing.max_apartments;

            await ToaNhaModel.update(id, { building_name, max_apartments });
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
