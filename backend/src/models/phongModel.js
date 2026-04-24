const db = require('../config/db.config');

const PhongModel = {
    // Lấy tất cả phòng
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT p.MaPhong, p.SoPhong, p.MaToaNha, p.DienTich, t.TenToaNha,
                   CASE 
                       WHEN p.TrangThai = 'Bảo trì' THEN 'Bảo trì'
                       WHEN (SELECT COUNT(*) FROM cudan c WHERE c.MaPhong = p.MaPhong) > 0 THEN 'Đang sử dụng'
                       ELSE 'Trống'
                   END AS TrangThai
            FROM phong p 
            LEFT JOIN toanha t ON p.MaToaNha = t.MaToaNha
        `);
        return rows;
    },

    // Lấy phòng theo MaPhong
    getById: async (MaPhong) => {
        const [rows] = await db.query(`
            SELECT p.MaPhong, p.SoPhong, p.MaToaNha, p.DienTich, t.TenToaNha,
                   CASE 
                       WHEN p.TrangThai = 'Bảo trì' THEN 'Bảo trì'
                       WHEN (SELECT COUNT(*) FROM cudan c WHERE c.MaPhong = p.MaPhong) > 0 THEN 'Đang sử dụng'
                       ELSE 'Trống'
                   END AS TrangThai
            FROM phong p 
            LEFT JOIN toanha t ON p.MaToaNha = t.MaToaNha
            WHERE p.MaPhong = ?
        `, [MaPhong]);
        return rows[0];
    },

    // Lấy phòng theo tòa nhà
    getByToaNha: async (MaToaNha) => {
        const [rows] = await db.query(`
            SELECT p.MaPhong, p.SoPhong, p.MaToaNha, p.DienTich,
                   CASE 
                       WHEN p.TrangThai = 'Bảo trì' THEN 'Bảo trì'
                       WHEN (SELECT COUNT(*) FROM cudan c WHERE c.MaPhong = p.MaPhong) > 0 THEN 'Đang sử dụng'
                       ELSE 'Trống'
                   END AS TrangThai
            FROM phong p 
            WHERE p.MaToaNha = ?
        `, [MaToaNha]);
        return rows;
    },

    // Tạo phòng mới
    create: async (data) => {
        const { MaPhong, SoPhong, MaToaNha, TrangThai, DienTich } = data;
        const [result] = await db.query(
            'INSERT INTO phong (MaPhong, SoPhong, MaToaNha, TrangThai, DienTich) VALUES (?, ?, ?, ?, ?)',
            [MaPhong, SoPhong, MaToaNha, TrangThai || 'Trống', DienTich]
        );
        return result.affectedRows;
    },

    // Cập nhật phòng
    update: async (MaPhong, data) => {
        const { SoPhong, MaToaNha, TrangThai, DienTich } = data;
        const [result] = await db.query(
            'UPDATE phong SET SoPhong = ?, MaToaNha = ?, TrangThai = ?, DienTich = ? WHERE MaPhong = ?',
            [SoPhong, MaToaNha, TrangThai, DienTich, MaPhong]
        );
        return result.affectedRows;
    },

    // Xóa phòng
    delete: async (MaPhong) => {
        const [result] = await db.query('DELETE FROM phong WHERE MaPhong = ?', [MaPhong]);
        return result.affectedRows;
    }
};

module.exports = PhongModel;
