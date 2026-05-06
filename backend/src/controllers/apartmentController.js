const PhongModel = require('../models/apartmentModel');
const response = require('../utils/responseFormat');

const generateId = () => 'PH' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

const PhongController = {
    getAll: async (req, res) => {
        try {
            const data = await PhongModel.getAll();
            return response.success(res, data, 'Lấy danh sách phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await PhongModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy phòng', 404);
            return response.success(res, data, 'Lấy thông tin phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByBuilding: async (req, res) => {
        try {
            const { building_id } = req.params;
            const data = await PhongModel.getByBuilding(building_id);
            return response.success(res, data, 'Lấy danh sách phòng theo tòa nhà thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { apartment_number, building_id, status, area } = req.body;
            if (!apartment_number) return response.error(res, 'Số phòng là bắt buộc', 400);

            const apartment_id = generateId();
            await PhongModel.create({ apartment_id, apartment_number, building_id, status, area });
            return response.success(res, { apartment_id }, 'Tạo phòng thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { apartment_number, building_id, status, area } = req.body;

            const existing = await PhongModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy phòng', 404);

            apartment_number = apartment_number !== undefined ? apartment_number : existing.apartment_number;
            building_id = building_id !== undefined ? building_id : existing.building_id;
            status = status !== undefined ? status : existing.status;
            area = area !== undefined ? area : existing.area;

            await PhongModel.update(id, { apartment_number, building_id, status, area });
            return response.success(res, null, 'Cập nhật phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await PhongModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy phòng', 404);

            await PhongModel.delete(id);
            return response.success(res, null, 'Xóa phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = PhongController;
