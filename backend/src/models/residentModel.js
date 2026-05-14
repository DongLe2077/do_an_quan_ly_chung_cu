const db = require('../config/db.config');

const ResidentModel = {
    // Lấy tất cả cư dân
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT cd.*, p.apartment_number, nd.username
            FROM residents cd 
            LEFT JOIN apartments p ON cd.apartment_id = p.apartment_id
            LEFT JOIN users nd ON cd.user_id = nd.user_id
        `);
        return rows;
    },

    getAllPaginated: async (limit, offset, search = '') => {
        let query = `
            SELECT cd.*, p.apartment_number, nd.username
            FROM residents cd 
            LEFT JOIN apartments p ON cd.apartment_id = p.apartment_id
            LEFT JOIN users nd ON cd.user_id = nd.user_id
        `;
        let queryParams = [];
        if (search) {
            query += ` WHERE cd.full_name LIKE ? OR cd.phone LIKE ? OR cd.id_card LIKE ?`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        query += ` ORDER BY cd.resident_id DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [rows] = await db.query(query, queryParams);
        return rows;
    },

    count: async (search = '') => {
        let query = 'SELECT COUNT(*) as total FROM residents cd';
        let queryParams = [];
        if (search) {
            query += ` WHERE cd.full_name LIKE ? OR cd.phone LIKE ? OR cd.id_card LIKE ?`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const [rows] = await db.query(query, queryParams);
        return rows[0].total;
    },

    // Lấy cư dân theo resident_id
    getById: async (residentId) => {
        const [rows] = await db.query(`
            SELECT cd.*, p.apartment_number, nd.username
            FROM residents cd 
            LEFT JOIN apartments p ON cd.apartment_id = p.apartment_id
            LEFT JOIN users nd ON cd.user_id = nd.user_id
            WHERE cd.resident_id = ?
        `, [residentId]);
        return rows[0];
    },

    // Lấy cư dân theo phòng
    getByApartment: async (apartmentId) => {
        const [rows] = await db.query('SELECT * FROM residents WHERE apartment_id = ?', [apartmentId]);
        return rows;
    },

    // Lấy cư dân theo người dùng
    getByUser: async (userId) => {
        const [rows] = await db.query('SELECT * FROM residents WHERE user_id = ?', [userId]);
        return rows[0];
    },

    // Tạo cư dân mới
    create: async (data) => {
        const { resident_id, full_name, phone, id_card, hometown, apartment_id, user_id } = data;
        const [result] = await db.query(
            'INSERT INTO residents (resident_id, full_name, phone, id_card, hometown, apartment_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [resident_id, full_name, phone, id_card, hometown, apartment_id, user_id]
        );
        return result.affectedRows;
    },

    // Cập nhật cư dân
    update: async (residentId, data) => {
        const { full_name, phone, id_card, hometown, apartment_id, user_id } = data;
        const [result] = await db.query(
            'UPDATE residents SET full_name = ?, phone = ?, id_card = ?, hometown = ?, apartment_id = ?, user_id = ? WHERE resident_id = ?',
            [full_name, phone, id_card, hometown, apartment_id, user_id, residentId]
        );
        return result.affectedRows;
    },

    // Xóa cư dân
    delete: async (residentId) => {
        const [result] = await db.query('DELETE FROM residents WHERE resident_id = ?', [residentId]);
        return result.affectedRows;
    }
};

module.exports = ResidentModel;
