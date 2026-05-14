const db = require('../config/db.config');

const ToaNhaModel = {
    // Lấy tất cả tòa nhà
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM buildings');
        return rows;
    },

    getAllPaginated: async (limit, offset) => {
        const [rows] = await db.query('SELECT * FROM buildings LIMIT ? OFFSET ?', [limit, offset]);
        return rows;
    },

    count: async () => {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM buildings');
        return rows[0].total;
    },

    // Lấy tòa nhà theo building_id
    getById: async (buildingId) => {
        const [rows] = await db.query('SELECT * FROM buildings WHERE building_id = ?', [buildingId]);
        return rows[0];
    },

    // Tạo tòa nhà mới
    create: async (data) => {
        const { building_id, building_name, max_apartments } = data;
        const [result] = await db.query(
            'INSERT INTO buildings (building_id, building_name, max_apartments) VALUES (?, ?, ?)',
            [building_id, building_name, max_apartments || 0]
        );
        return result.affectedRows;
    },

    // Cập nhật tòa nhà
    update: async (buildingId, data) => {
        const { building_name, max_apartments } = data;
        const [result] = await db.query(
            'UPDATE buildings SET building_name = ?, max_apartments = ? WHERE building_id = ?',
            [building_name, max_apartments, buildingId]
        );
        return result.affectedRows;
    },

    // Xóa tòa nhà
    delete: async (buildingId) => {
        const [result] = await db.query('DELETE FROM buildings WHERE building_id = ?', [buildingId]);
        return result.affectedRows;
    }
};

module.exports = ToaNhaModel;
