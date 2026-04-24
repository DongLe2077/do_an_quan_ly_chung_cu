const db = require('../config/db.config');

const NguoiDungModel = {
    // Lấy tất cả người dùng
    getAll: async () => {
        const [rows] = await db.query('SELECT MaNguoiDung, TenDangNhap, VaiTro, TrangThai, Email FROM nguoidung');
        return rows;
    },

    // Lấy người dùng theo MaNguoiDung
    getById: async (MaNguoiDung) => {
        const [rows] = await db.query(
            'SELECT MaNguoiDung, TenDangNhap, VaiTro, TrangThai, Email FROM nguoidung WHERE MaNguoiDung = ?',
            [MaNguoiDung]
        );
        return rows[0];
    },

    // Lấy người dùng theo tên đăng nhập (dùng cho login)
    getByUsername: async (TenDangNhap) => {
        const [rows] = await db.query('SELECT * FROM nguoidung WHERE TenDangNhap = ?', [TenDangNhap]);
        return rows[0];
    },

    // Tạo người dùng mới
    create: async (data) => {
        const { MaNguoiDung, TenDangNhap, MatKhau, VaiTro, TrangThai, Email } = data;
        const [result] = await db.query(
            'INSERT INTO nguoidung (MaNguoiDung, TenDangNhap, MatKhau, VaiTro, TrangThai, Email) VALUES (?, ?, ?, ?, ?, ?)',
            [MaNguoiDung, TenDangNhap, MatKhau, VaiTro || 'cudan', TrangThai || 'Hoạt động', Email || null]
        );
        return result.affectedRows;
    },

    // Cập nhật người dùng
    update: async (MaNguoiDung, data) => {
        const { VaiTro, TrangThai, Email } = data;
        const [result] = await db.query(
            'UPDATE nguoidung SET VaiTro = ?, TrangThai = ?, Email = ? WHERE MaNguoiDung = ?',
            [VaiTro, TrangThai, Email, MaNguoiDung]
        );
        return result.affectedRows;
    },

    // Cập nhật mật khẩu
    updatePassword: async (MaNguoiDung, MatKhau) => {
        const [result] = await db.query('UPDATE nguoidung SET MatKhau = ? WHERE MaNguoiDung = ?', [MatKhau, MaNguoiDung]);
        return result.affectedRows;
    },

    // Cập nhật role (phân quyền)
    updateRole: async (MaNguoiDung, VaiTro) => {
        const [result] = await db.query('UPDATE nguoidung SET VaiTro = ? WHERE MaNguoiDung = ?', [VaiTro, MaNguoiDung]);
        return result.affectedRows;
    },

    // Lấy user với mật khẩu (dùng cho đổi mật khẩu)
    getByIdWithPassword: async (MaNguoiDung) => {
        const [rows] = await db.query('SELECT * FROM nguoidung WHERE MaNguoiDung = ?', [MaNguoiDung]);
        return rows[0];
    },

    // Xóa người dùng
    delete: async (MaNguoiDung) => {
        const [result] = await db.query('DELETE FROM nguoidung WHERE MaNguoiDung = ?', [MaNguoiDung]);
        return result.affectedRows;
    }
};

module.exports = NguoiDungModel;
