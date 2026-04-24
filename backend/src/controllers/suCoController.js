const SuCoModel = require('../models/suCoModel');
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
            const { TrangThai } = req.params;
            const data = await SuCoModel.getByTrangThai(TrangThai);
            return response.success(res, data, 'Lấy danh sách sự cố theo trạng thái thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByNguoiBao: async (req, res) => {
        try {
            const { MaNguoiBao } = req.params;
            const data = await SuCoModel.getByNguoiBao(MaNguoiBao);
            return response.success(res, data, 'Lấy danh sách sự cố theo người báo thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByPhong: async (req, res) => {
        try {
            const { MaPhong } = req.params;
            const data = await SuCoModel.getByPhong(MaPhong);
            return response.success(res, data, 'Lấy danh sách sự cố theo phòng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { MaSuCo, MaNguoiBao, MaPhong, TenSuCo, MoTa, AnhSuCo, NgayBaoCao, TrangThai } = req.body;
            if (!TenSuCo || !MoTa) return response.error(res, 'Tên sự cố và mô tả là bắt buộc', 400);

            const maSuCo = MaSuCo || generateId();
            await SuCoModel.create({
                MaSuCo: maSuCo, MaNguoiBao, MaPhong, TenSuCo, MoTa, AnhSuCo, NgayBaoCao,
                TrangThai: TrangThai || 'Chờ duyệt'
            });
            return response.success(res, { MaSuCo: maSuCo }, 'Báo cáo sự cố thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { TenSuCo, MoTa, AnhSuCo, TrangThai, NguoiXuLy, NgayXuLy } = req.body;

            const existing = await SuCoModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy sự cố', 404);

            TenSuCo = TenSuCo !== undefined ? TenSuCo : existing.TenSuCo;
            MoTa = MoTa !== undefined ? MoTa : existing.MoTa;
            AnhSuCo = AnhSuCo !== undefined ? AnhSuCo : existing.AnhSuCo;
            TrangThai = TrangThai !== undefined ? TrangThai : existing.TrangThai;
            NguoiXuLy = NguoiXuLy !== undefined ? NguoiXuLy : existing.NguoiXuLy;
            NgayXuLy = NgayXuLy !== undefined ? NgayXuLy : existing.NgayXuLy;

            await SuCoModel.update(id, { TenSuCo, MoTa, AnhSuCo, TrangThai, NguoiXuLy, NgayXuLy });
            return response.success(res, null, 'Cập nhật sự cố thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    xuLy: async (req, res) => {
        try {
            const { id } = req.params;
            const { NguoiXuLy, TrangThai } = req.body;

            const existing = await SuCoModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy sự cố', 404);

            await SuCoModel.updateTrangThai(id, TrangThai, NguoiXuLy);
            return response.success(res, null, 'Cập nhật trạng thái sự cố thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await SuCoModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy sự cố', 404);

            await SuCoModel.delete(id);
            return response.success(res, null, 'Xóa sự cố thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = SuCoController;
