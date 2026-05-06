const ResidentModel = require('../models/residentModel');
const response = require('../utils/responseFormat');

const generateId = () => 'CD' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

const ThongTinCuDanController = {
    getAll: async (req, res) => {
        try {
            const data = await ResidentModel.getAll();
            return response.success(res, data, 'Lấy danh sách cư dân thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await ResidentModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy cư dân', 404);
            return response.success(res, data, 'Lấy thông tin cư dân thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByApartment: async (req, res) => {
        try {
            const { apartment_id } = req.params;
            const data = await ResidentModel.getByApartment(apartment_id);
            return response.success(res, data, 'Lấy danh sách cư dân theo phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByUser: async (req, res) => {
        try {
            const { user_id } = req.params;
            const data = await ResidentModel.getByUser(user_id);
            if (!data) return response.error(res, 'Không tìm thấy thông tin cư dân', 404);
            return response.success(res, data, 'Lấy thông tin cư dân theo người dùng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { id_card, full_name, phone, hometown, apartment_id, user_id } = req.body;
            if (!full_name) return response.error(res, 'Họ tên là bắt buộc', 400);

            const resident_id = generateId();
            await ResidentModel.create({ resident_id, full_name, phone, id_card, hometown, apartment_id, user_id });
            return response.success(res, { resident_id }, 'Tạo cư dân thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { full_name, phone, id_card, hometown, apartment_id, user_id } = req.body;

            const existing = await ResidentModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy cư dân', 404);

            full_name = full_name !== undefined ? full_name : existing.full_name;
            phone = phone !== undefined ? phone : existing.phone;
            id_card = id_card !== undefined ? id_card : existing.id_card;
            hometown = hometown !== undefined ? hometown : existing.hometown;
            apartment_id = apartment_id !== undefined ? apartment_id : existing.apartment_id;
            user_id = user_id !== undefined ? user_id : existing.user_id;

            await ResidentModel.update(id, { full_name, phone, id_card, hometown, apartment_id, user_id });
            return response.success(res, null, 'Cập nhật cư dân thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await ResidentModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy cư dân', 404);

            await ResidentModel.delete(id);
            return response.success(res, null, 'Xóa cư dân thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = ThongTinCuDanController;
