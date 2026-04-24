const db = require('../config/db.config');

const ChiSoDichVuModel = {
    // Lấy tất cả chỉ số dịch vụ
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.TenDichVu, dv.DonGia, dv.LoaiDichVu, dv.DonViTinh,
                   hd.MaHoaDon as MaHoaDonRef, hd.ThangThu, p.SoPhong
            FROM chisodichvu csdv 
            LEFT JOIN danhsachdichvu dv ON csdv.MaDichVu = dv.MaDichVu
            LEFT JOIN hoadon hd ON csdv.MaHoaDon = hd.MaHoaDon
            LEFT JOIN phong p ON hd.MaPhong = p.MaPhong
            ORDER BY csdv.NgayGhi DESC
        `);
        return rows;
    },

    // Lấy chỉ số dịch vụ theo MaGhi
    getById: async (MaGhi) => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.TenDichVu, dv.DonGia, dv.LoaiDichVu
            FROM chisodichvu csdv 
            LEFT JOIN danhsachdichvu dv ON csdv.MaDichVu = dv.MaDichVu
            LEFT JOIN hoadon hd ON csdv.MaHoaDon = hd.MaHoaDon
            WHERE csdv.MaGhi = ?
        `, [MaGhi]);
        return rows[0];
    },

    // Lấy chỉ số theo hóa đơn
    getByHoaDon: async (MaHoaDon) => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.TenDichVu, dv.DonGia, dv.LoaiDichVu
            FROM chisodichvu csdv
            LEFT JOIN danhsachdichvu dv ON csdv.MaDichVu = dv.MaDichVu
            WHERE csdv.MaHoaDon = ?
        `, [MaHoaDon]);
        return rows;
    },

    // Lấy chỉ số theo ngày ghi
    getByNgayGhi: async (NgayGhi) => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.TenDichVu, dv.DonGia, dv.LoaiDichVu
            FROM chisodichvu csdv
            LEFT JOIN danhsachdichvu dv ON csdv.MaDichVu = dv.MaDichVu
            WHERE csdv.NgayGhi = ?
        `, [NgayGhi]);
        return rows;
    },

    // Tạo chỉ số mới
    create: async (data) => {
        const { MaGhi, MaDichVu, MaHoaDon, ChiSoLanGhiTruoc, ChiSoHienTai, SoLuong, NgayGhi } = data;
        const [result] = await db.query(
            'INSERT INTO chisodichvu (MaGhi, MaDichVu, MaHoaDon, ChiSoLanGhiTruoc, ChiSoHienTai, SoLuong, NgayGhi) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [MaGhi, MaDichVu || null, MaHoaDon || null, ChiSoLanGhiTruoc !== undefined ? ChiSoLanGhiTruoc : null, ChiSoHienTai !== undefined ? ChiSoHienTai : null, SoLuong !== undefined ? SoLuong : null, NgayGhi]
        );
        return result.affectedRows;
    },

    // Cập nhật chỉ số
    update: async (MaGhi, data) => {
        const { MaDichVu, MaHoaDon, ChiSoLanGhiTruoc, ChiSoHienTai, SoLuong, NgayGhi } = data;
        const [result] = await db.query(
            'UPDATE chisodichvu SET MaDichVu = ?, MaHoaDon = ?, ChiSoLanGhiTruoc = ?, ChiSoHienTai = ?, SoLuong = ?, NgayGhi = ? WHERE MaGhi = ?',
            [MaDichVu, MaHoaDon, ChiSoLanGhiTruoc, ChiSoHienTai, SoLuong, NgayGhi, MaGhi]
        );
        return result.affectedRows;
    },

    // Xóa chỉ số
    delete: async (MaGhi) => {
        const [result] = await db.query('DELETE FROM chisodichvu WHERE MaGhi = ?', [MaGhi]);
        return result.affectedRows;
    }
};

module.exports = ChiSoDichVuModel;
