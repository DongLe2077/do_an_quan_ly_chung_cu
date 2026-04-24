const db = require('../config/db.config');

const ThongTinCuDanModel = {
    // Lấy tất cả cư dân
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT cd.*, p.SoPhong, nd.TenDangNhap
            FROM cudan cd 
            LEFT JOIN phong p ON cd.MaPhong = p.MaPhong
            LEFT JOIN nguoidung nd ON cd.MaNguoiDung = nd.MaNguoiDung
        `);
        return rows;
    },

    // Lấy cư dân theo MaCuDan
    getById: async (MaCuDan) => {
        const [rows] = await db.query(`
            SELECT cd.*, p.SoPhong, nd.TenDangNhap
            FROM cudan cd 
            LEFT JOIN phong p ON cd.MaPhong = p.MaPhong
            LEFT JOIN nguoidung nd ON cd.MaNguoiDung = nd.MaNguoiDung
            WHERE cd.MaCuDan = ?
        `, [MaCuDan]);
        return rows[0];
    },

    // Lấy cư dân theo phòng
    getByPhong: async (MaPhong) => {
        const [rows] = await db.query('SELECT * FROM cudan WHERE MaPhong = ?', [MaPhong]);
        return rows;
    },

    // Lấy cư dân theo người dùng
    getByNguoiDung: async (MaNguoiDung) => {
        const [rows] = await db.query('SELECT * FROM cudan WHERE MaNguoiDung = ?', [MaNguoiDung]);
        return rows[0];
    },

    // Tạo cư dân mới
    create: async (data) => {
        const { MaCuDan, HoTen, SoDienThoai, CCCD, QueQuan, MaPhong, MaNguoiDung } = data;
        const [result] = await db.query(
            'INSERT INTO cudan (MaCuDan, HoTen, SoDienThoai, CCCD, QueQuan, MaPhong, MaNguoiDung) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [MaCuDan, HoTen, SoDienThoai, CCCD, QueQuan, MaPhong, MaNguoiDung]
        );
        return result.affectedRows;
    },

    // Cập nhật cư dân
    update: async (MaCuDan, data) => {
        const { HoTen, SoDienThoai, CCCD, QueQuan, MaPhong, MaNguoiDung } = data;
        const [result] = await db.query(
            'UPDATE cudan SET HoTen = ?, SoDienThoai = ?, CCCD = ?, QueQuan = ?, MaPhong = ?, MaNguoiDung = ? WHERE MaCuDan = ?',
            [HoTen, SoDienThoai, CCCD, QueQuan, MaPhong, MaNguoiDung, MaCuDan]
        );
        return result.affectedRows;
    },

    // Xóa cư dân
    delete: async (MaCuDan) => {
        const [result] = await db.query('DELETE FROM cudan WHERE MaCuDan = ?', [MaCuDan]);
        return result.affectedRows;
    }
};

module.exports = ThongTinCuDanModel;
