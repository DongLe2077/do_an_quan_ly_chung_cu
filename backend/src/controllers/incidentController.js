const SuCoModel = require('../models/incidentModel');
const response = require('../utils/responseFormat');

const generateId = () => 'SC' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

const SuCoController = {
    getAll: async (req, res) => {
        try {
            const data = await SuCoModel.getAll();
            return response.success(res, data, 'Lấy danh sách sự cố thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await SuCoModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy sự cố', 404);
            return response.success(res, data, 'Lấy thông tin sự cố thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByTrangThai: async (req, res) => {
        try {
            const { status } = req.params;
            const data = await SuCoModel.getByTrangThai(status);
            return response.success(res, data, 'Lấy danh sách sự cố theo trạng thái thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByNguoiBao: async (req, res) => {
        try {
            const { reporter_id } = req.params;
            const data = await SuCoModel.getByNguoiBao(reporter_id);
            return response.success(res, data, 'Lấy danh sách sự cố theo người báo thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByApartment: async (req, res) => {
        try {
            const { apartment_id } = req.params;
            const data = await SuCoModel.getByApartment(apartment_id);
            return response.success(res, data, 'Lấy danh sách sự cố theo phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { incident_id, reporter_id, apartment_id, title, description, images, report_date, status } = req.body;
            if (!title || !description) return response.error(res, 'Tên sự cố và mô tả là bắt buộc', 400);

            const incidentId = incident_id || generateId();
            await SuCoModel.create({
                incident_id: incidentId, reporter_id, apartment_id, title, description, images, report_date,
                status: status || 'Chờ duyệt'
            });
            return response.success(res, { incident_id: incidentId }, 'Báo cáo sự cố thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { user } = req;
            let { title, description, images, status, handler, resolved_date } = req.body;

            const existing = await SuCoModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy sự cố', 404);

            // Kiểm tra quyền hạn nếu không phải admin
            if (user.role !== 'admin') {
                if (existing.reporter_id !== user.user_id) {
                    return response.error(res, 'Bạn không có quyền sửa sự cố này', 403);
                }
                if (existing.status !== 'Chờ duyệt') {
                    return response.error(res, `Không thể sửa sự cố khi trạng thái là: ${existing.status}`, 400);
                }
                // Cư dân không được phép tự ý sửa trạng thái hoặc thông tin xử lý
                status = existing.status;
                handler = existing.handler;
                resolved_date = existing.resolved_date;
            }

            title = title !== undefined ? title : existing.title;
            description = description !== undefined ? description : existing.description;
            images = images !== undefined ? images : existing.images;
            status = status !== undefined ? status : existing.status;
            handler = handler !== undefined ? handler : existing.handler;
            resolved_date = resolved_date !== undefined ? resolved_date : existing.resolved_date;

            await SuCoModel.update(id, { title, description, images, status, handler, resolved_date });
            return response.success(res, null, 'Cập nhật sự cố thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    xuLy: async (req, res) => {
        try {
            const { id } = req.params;
            const { handler, status } = req.body;

            const existing = await SuCoModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy sự cố', 404);

            await SuCoModel.updateTrangThai(id, status, handler);
            return response.success(res, null, 'Cập nhật trạng thái sự cố thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const { user } = req;

            const existing = await SuCoModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy sự cố', 404);

            // Kiểm tra quyền hạn nếu không phải admin
            if (user.role !== 'admin') {
                if (existing.reporter_id !== user.user_id) {
                    return response.error(res, 'Bạn không có quyền xóa sự cố này', 403);
                }
                if (existing.status !== 'Chờ duyệt') {
                    return response.error(res, 'Không thể hủy sự cố khi đã được duyệt hoặc đang xử lý', 400);
                }
            }

            await SuCoModel.delete(id);
            return response.success(res, null, 'Xóa sự cố thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = SuCoController;
