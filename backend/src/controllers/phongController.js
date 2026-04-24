const PhongModel = require('../models/phongModel');
const response = require('../utils/responseFormat');

const generateId = () => 'P' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

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

    getByToaNha: async (req, res) => {
        try {
            const { MaToaNha } = req.params;
            const data = await PhongModel.getByToaNha(MaToaNha);
            return response.success(res, data, 'Lấy danh sách phòng theo tòa nhà thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { MaPhong, SoPhong, MaToaNha, TrangThai, DienTich } = req.body;
            if (!SoPhong || !MaToaNha) return response.error(res, 'Số phòng và tòa nhà là bắt buộc', 400);

            const maPhong = MaPhong || generateId();
            await PhongModel.create({ MaPhong: maPhong, SoPhong, MaToaNha, TrangThai: TrangThai || 'Trống', DienTich });
            return response.success(res, { MaPhong: maPhong }, 'Tạo phòng thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { SoPhong, MaToaNha, TrangThai, DienTich } = req.body;

            const existing = await PhongModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy phòng', 404);

            // Giữ nguyên giá trị cũ nếu người dùng không gửi lên trong body
            SoPhong = SoPhong !== undefined ? SoPhong : existing.SoPhong;
            MaToaNha = MaToaNha !== undefined ? MaToaNha : existing.MaToaNha;
            TrangThai = TrangThai !== undefined ? TrangThai : existing.TrangThai;
            DienTich = DienTich !== undefined ? DienTich : existing.DienTich;

            await PhongModel.update(id, { SoPhong, MaToaNha, TrangThai, DienTich });
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
