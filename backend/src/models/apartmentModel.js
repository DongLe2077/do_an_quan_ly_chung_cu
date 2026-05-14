const db = require('../config/db.config');

const PhongModel = {
    // Lấy tất cả phòng
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT p.apartment_id, p.apartment_number, p.building_id, p.area, t.building_name,
                   CASE 
                       WHEN p.status = 'Bảo trì' THEN 'Bảo trì'
                       WHEN (SELECT COUNT(*) FROM residents c WHERE c.apartment_id = p.apartment_id) > 0 THEN 'Đang sử dụng'
                       ELSE 'Trống'
                   END AS status
            FROM apartments p 
            LEFT JOIN buildings t ON p.building_id = t.building_id
        `);
        return rows;
    },

    getAllPaginated: async (limit, offset, search = '', buildingId = '') => {
        let query = `
            SELECT p.apartment_id, p.apartment_number, p.building_id, p.area, t.building_name,
                   CASE 
                       WHEN p.status = 'Bảo trì' THEN 'Bảo trì'
                       WHEN (SELECT COUNT(*) FROM residents c WHERE c.apartment_id = p.apartment_id) > 0 THEN 'Đang sử dụng'
                       ELSE 'Trống'
                   END AS status
            FROM apartments p 
            LEFT JOIN buildings t ON p.building_id = t.building_id
            WHERE 1=1
        `;
        let queryParams = [];

        if (search) {
            query += ` AND p.apartment_number LIKE ?`;
            queryParams.push(`%${search}%`);
        }
        if (buildingId) {
            query += ` AND p.building_id = ?`;
            queryParams.push(buildingId);
        }

        query += ` ORDER BY p.apartment_number ASC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [rows] = await db.query(query, queryParams);
        return rows;
    },

    count: async (search = '', buildingId = '') => {
        let query = 'SELECT COUNT(*) as total FROM apartments p WHERE 1=1';
        let queryParams = [];

        if (search) {
            query += ` AND p.apartment_number LIKE ?`;
            queryParams.push(`%${search}%`);
        }
        if (buildingId) {
            query += ` AND p.building_id = ?`;
            queryParams.push(buildingId);
        }

        const [rows] = await db.query(query, queryParams);
        return rows[0].total;
    },

    // Lấy phòng theo apartment_id
    getById: async (apartmentId) => {
        const [rows] = await db.query(`
            SELECT p.apartment_id, p.apartment_number, p.building_id, p.area, t.building_name,
                   CASE 
                       WHEN p.status = 'Bảo trì' THEN 'Bảo trì'
                       WHEN (SELECT COUNT(*) FROM residents c WHERE c.apartment_id = p.apartment_id) > 0 THEN 'Đang sử dụng'
                       ELSE 'Trống'
                   END AS status
            FROM apartments p 
            LEFT JOIN buildings t ON p.building_id = t.building_id
            WHERE p.apartment_id = ?
        `, [apartmentId]);
        return rows[0];
    },

    // Lấy phòng theo tòa nhà
    getByBuilding: async (buildingId) => {
        const [rows] = await db.query(`
            SELECT p.apartment_id, p.apartment_number, p.building_id, p.area,
                   CASE 
                       WHEN p.status = 'Bảo trì' THEN 'Bảo trì'
                       WHEN (SELECT COUNT(*) FROM residents c WHERE c.apartment_id = p.apartment_id) > 0 THEN 'Đang sử dụng'
                       ELSE 'Trống'
                   END AS status
            FROM apartments p 
            WHERE p.building_id = ?
        `, [buildingId]);
        return rows;
    },

    // Tạo phòng mới
    create: async (data) => {
        const { apartment_id, apartment_number, building_id, status, area } = data;
        const [result] = await db.query(
            'INSERT INTO apartments (apartment_id, apartment_number, building_id, status, area) VALUES (?, ?, ?, ?, ?)',
            [apartment_id, apartment_number, building_id, status || 'Trống', area]
        );
        return result.affectedRows;
    },

    // Cập nhật phòng
    update: async (apartmentId, data) => {
        const { apartment_number, building_id, status, area } = data;
        const [result] = await db.query(
            'UPDATE apartments SET apartment_number = ?, building_id = ?, status = ?, area = ? WHERE apartment_id = ?',
            [apartment_number, building_id, status, area, apartmentId]
        );
        return result.affectedRows;
    },

    // Xóa phòng
    delete: async (apartmentId) => {
        const [result] = await db.query('DELETE FROM apartments WHERE apartment_id = ?', [apartmentId]);
        return result.affectedRows;
    }
};

module.exports = PhongModel;
