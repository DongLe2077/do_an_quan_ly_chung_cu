const db = require('../config/db.config');

const SuCoModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT sc.*, nd.username as reporter_name, p.apartment_number
            FROM incidents sc 
            LEFT JOIN users nd ON sc.reporter_id = nd.user_id
            LEFT JOIN apartments p ON sc.apartment_id = p.apartment_id
        `);
        return rows;
    },

    getAllPaginated: async (limit, offset, search = '', status = '') => {
        let query = `
            SELECT sc.*, nd.username as reporter_name, p.apartment_number
            FROM incidents sc 
            LEFT JOIN users nd ON sc.reporter_id = nd.user_id
            LEFT JOIN apartments p ON sc.apartment_id = p.apartment_id
            WHERE 1=1
        `;
        let queryParams = [];

        if (search) {
            query += ` AND (sc.title LIKE ? OR sc.description LIKE ? OR p.apartment_number LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (status) {
            query += ` AND sc.status = ?`;
            queryParams.push(status);
        }

        query += ` ORDER BY sc.created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [rows] = await db.query(query, queryParams);
        return rows;
    },

    count: async (search = '', status = '') => {
        let query = `
            SELECT COUNT(*) as total 
            FROM incidents sc 
            LEFT JOIN apartments p ON sc.apartment_id = p.apartment_id
            WHERE 1=1
        `;
        let queryParams = [];

        if (search) {
            query += ` AND (sc.title LIKE ? OR sc.description LIKE ? OR p.apartment_number LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (status) {
            query += ` AND sc.status = ?`;
            queryParams.push(status);
        }

        const [rows] = await db.query(query, queryParams);
        return rows[0].total;
    },

    getById: async (incidentId) => {
        const [rows] = await db.query(`
            SELECT sc.*, nd.username as reporter_name, p.apartment_number
            FROM incidents sc 
            LEFT JOIN users nd ON sc.reporter_id = nd.user_id
            LEFT JOIN apartments p ON sc.apartment_id = p.apartment_id
            WHERE sc.incident_id = ?
        `, [incidentId]);
        return rows[0];
    },

    getByTrangThai: async (status) => {
        const [rows] = await db.query('SELECT * FROM incidents WHERE status = ?', [status]);
        return rows;
    },

    getByNguoiBao: async (reporterId) => {
        const [rows] = await db.query(`
            SELECT sc.*, nd.username as reporter_name, p.apartment_number
            FROM incidents sc 
            LEFT JOIN users nd ON sc.reporter_id = nd.user_id
            LEFT JOIN apartments p ON sc.apartment_id = p.apartment_id
            WHERE sc.reporter_id = ?
        `, [reporterId]);
        return rows;
    },

    getByApartment: async (apartmentId) => {
        const [rows] = await db.query('SELECT * FROM incidents WHERE apartment_id = ?', [apartmentId]);
        return rows;
    },

    create: async (data) => {
        const { incident_id, reporter_id, apartment_id, title, description, images, report_date, status } = data;
        const [result] = await db.query(
            'INSERT INTO incidents (incident_id, reporter_id, apartment_id, title, description, images, report_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [incident_id, reporter_id, apartment_id, title, description, images, report_date || new Date().toISOString().split('T')[0], status || 'Chờ duyệt']
        );
        return result.affectedRows;
    },

    update: async (incidentId, data) => {
        const { title, description, images, status, handler, resolved_date } = data;
        const [result] = await db.query(
            'UPDATE incidents SET title = ?, description = ?, images = ?, status = ?, handler = ?, resolved_date = ? WHERE incident_id = ?',
            [title, description, images, status, handler, resolved_date, incidentId]
        );
        return result.affectedRows;
    },

    updateTrangThai: async (incidentId, status, handler) => {
        const [result] = await db.query(
            'UPDATE incidents SET status = ?, handler = ?, resolved_date = ? WHERE incident_id = ?',
            [status, handler, new Date().toISOString().split('T')[0], incidentId]
        );
        return result.affectedRows;
    },

    delete: async (incidentId) => {
        const [result] = await db.query('DELETE FROM incidents WHERE incident_id = ?', [incidentId]);
        return result.affectedRows;
    }
};

module.exports = SuCoModel;
