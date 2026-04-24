const db = require('../config/db.config');

const DanhSachDichVuModel = {
    // Lấy tất cả dịch vụ
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM danhsachdichvu');
        return rows;
    },

    // Lấy dịch vụ theo MaDichVu
    getById: async (MaDichVu) => {
        const [rows] = await db.query('SELECT * FROM danhsachdichvu WHERE MaDichVu = ?', [MaDichVu]);
        return rows[0];
    },

    // Tạo dịch vụ mới
    create: async (data) => {
        const { MaDichVu, TenDichVu, DonGia, DonViTinh, LoaiDichVu } = data;
        const [result] = await db.query(
            'INSERT INTO danhsachdichvu (MaDichVu, TenDichVu, DonGia, DonViTinh, LoaiDichVu) VALUES (?, ?, ?, ?, ?)',
            [MaDichVu, TenDichVu, DonGia || 0, DonViTinh || null, LoaiDichVu || 1]
        );
        return result.affectedRows;
    },

    // Cập nhật dịch vụ
    update: async (MaDichVu, data) => {
        const { TenDichVu, DonGia, DonViTinh, LoaiDichVu } = data;
        const [result] = await db.query(
            'UPDATE danhsachdichvu SET TenDichVu = ?, DonGia = ?, DonViTinh = ?, LoaiDichVu = ? WHERE MaDichVu = ?',
            [TenDichVu, DonGia, DonViTinh, LoaiDichVu, MaDichVu]
        );
        return result.affectedRows;
    },

    // Xóa dịch vụ
    delete: async (MaDichVu) => {
        const [result] = await db.query('DELETE FROM danhsachdichvu WHERE MaDichVu = ?', [MaDichVu]);
        return result.affectedRows;
    }
};

module.exports = DanhSachDichVuModel;
