const db = require('../config/db.config');

const SuCoModel = {
    // Lấy tất cả sự cố
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT sc.*, nd.TenDangNhap as TenNguoiBao, p.SoPhong
            FROM suco sc 
            LEFT JOIN nguoidung nd ON sc.MaNguoiBao = nd.MaNguoiDung
            LEFT JOIN phong p ON sc.MaPhong = p.MaPhong
        `);
        return rows;
    },

    // Lấy sự cố theo MaSuCo
    getById: async (MaSuCo) => {
        const [rows] = await db.query(`
            SELECT sc.*, nd.TenDangNhap as TenNguoiBao, p.SoPhong
            FROM suco sc 
            LEFT JOIN nguoidung nd ON sc.MaNguoiBao = nd.MaNguoiDung
            LEFT JOIN phong p ON sc.MaPhong = p.MaPhong
            WHERE sc.MaSuCo = ?
        `, [MaSuCo]);
        return rows[0];
    },

    // Lấy sự cố theo trạng thái
    getByTrangThai: async (TrangThai) => {
        const [rows] = await db.query('SELECT * FROM suco WHERE TrangThai = ?', [TrangThai]);
        return rows;
    },

    // Lấy sự cố theo người báo
    getByNguoiBao: async (MaNguoiBao) => {
        const [rows] = await db.query(`
            SELECT sc.*, nd.TenDangNhap as TenNguoiBao, p.SoPhong
            FROM suco sc 
            LEFT JOIN nguoidung nd ON sc.MaNguoiBao = nd.MaNguoiDung
            LEFT JOIN phong p ON sc.MaPhong = p.MaPhong
            WHERE sc.MaNguoiBao = ?
        `, [MaNguoiBao]);
        return rows;
    },

    // Lấy sự cố theo phòng
    getByPhong: async (MaPhong) => {
        const [rows] = await db.query('SELECT * FROM suco WHERE MaPhong = ?', [MaPhong]);
        return rows;
    },

    // Tạo sự cố mới
    create: async (data) => {
        const { MaSuCo, MaNguoiBao, MaPhong, TenSuCo, MoTa, AnhSuCo, NgayBaoCao, TrangThai } = data;
        const [result] = await db.query(
            'INSERT INTO suco (MaSuCo, MaNguoiBao, MaPhong, TenSuCo, MoTa, AnhSuCo, NgayBaoCao, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [MaSuCo, MaNguoiBao, MaPhong, TenSuCo, MoTa, AnhSuCo, NgayBaoCao || new Date().toISOString().split('T')[0], TrangThai || 'Chờ duyệt']
        );
        return result.affectedRows;
    },

    // Cập nhật sự cố
    update: async (MaSuCo, data) => {
        const { TenSuCo, MoTa, AnhSuCo, TrangThai, NguoiXuLy, NgayXuLy } = data;
        const [result] = await db.query(
            'UPDATE suco SET TenSuCo = ?, MoTa = ?, AnhSuCo = ?, TrangThai = ?, NguoiXuLy = ?, NgayXuLy = ? WHERE MaSuCo = ?',
            [TenSuCo, MoTa, AnhSuCo, TrangThai, NguoiXuLy, NgayXuLy, MaSuCo]
        );
        return result.affectedRows;
    },

    // Cập nhật trạng thái sự cố
    updateTrangThai: async (MaSuCo, TrangThai, NguoiXuLy) => {
        const [result] = await db.query(
            'UPDATE suco SET TrangThai = ?, NguoiXuLy = ?, NgayXuLy = ? WHERE MaSuCo = ?',
            [TrangThai, NguoiXuLy, new Date().toISOString().split('T')[0], MaSuCo]
        );
        return result.affectedRows;
    },

    // Xóa sự cố
    delete: async (MaSuCo) => {
        const [result] = await db.query('DELETE FROM suco WHERE MaSuCo = ?', [MaSuCo]);
        return result.affectedRows;
    }
};

module.exports = SuCoModel;
