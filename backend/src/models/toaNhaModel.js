const db = require('../config/db.config');

const ToaNhaModel = {
    // Lấy tất cả tòa nhà
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM toanha');
        return rows;
    },

    // Lấy tòa nhà theo MaToaNha
    getById: async (MaToaNha) => {
        const [rows] = await db.query('SELECT * FROM toanha WHERE MaToaNha = ?', [MaToaNha]);
        return rows[0];
    },

    // Tạo tòa nhà mới
    create: async (data) => {
        const { MaToaNha, TenToaNha, SoLuongPhong } = data;
        const [result] = await db.query(
            'INSERT INTO toanha (MaToaNha, TenToaNha, SoLuongPhong) VALUES (?, ?, ?)',
            [MaToaNha, TenToaNha, SoLuongPhong || 0]
        );
        return result.affectedRows;
    },

    // Cập nhật tòa nhà
    update: async (MaToaNha, data) => {
        const { TenToaNha, SoLuongPhong } = data;
        const [result] = await db.query(
            'UPDATE toanha SET TenToaNha = ?, SoLuongPhong = ? WHERE MaToaNha = ?',
            [TenToaNha, SoLuongPhong, MaToaNha]
        );
        return result.affectedRows;
    },

    // Xóa tòa nhà
    delete: async (MaToaNha) => {
        const [result] = await db.query('DELETE FROM toanha WHERE MaToaNha = ?', [MaToaNha]);
        return result.affectedRows;
    }
};

module.exports = ToaNhaModel;
