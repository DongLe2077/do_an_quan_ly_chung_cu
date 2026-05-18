const db = require('../config/db.config');

const HoaDonModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT hd.*, p.apartment_number 
            FROM invoices hd 
            LEFT JOIN apartments p ON hd.apartment_id = p.apartment_id
            ORDER BY hd.created_at DESC
        `);
        return rows;
    },

    getAllPaginated: async (limit, offset, search = '', status = '') => {
        let query = `
            SELECT hd.*, p.apartment_number 
            FROM invoices hd 
            LEFT JOIN apartments p ON hd.apartment_id = p.apartment_id
            WHERE 1=1
        `;
        let queryParams = [];

        if (search) {
            query += ` AND p.apartment_number LIKE ?`;
            queryParams.push(`%${search}%`);
        }
        if (status) {
            query += ` AND hd.status = ?`;
            queryParams.push(status);
        }

        query += ` ORDER BY hd.created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [rows] = await db.query(query, queryParams);
        return rows;
    },

    count: async (search = '', status = '') => {
        let query = `
            SELECT COUNT(*) as total 
            FROM invoices hd 
            LEFT JOIN apartments p ON hd.apartment_id = p.apartment_id
            WHERE 1=1
        `;
        let queryParams = [];

        if (search) {
            query += ` AND p.apartment_number LIKE ?`;
            queryParams.push(`%${search}%`);
        }
        if (status) {
            query += ` AND hd.status = ?`;
            queryParams.push(status);
        }

        const [rows] = await db.query(query, queryParams);
        return rows[0].total;
    },

    getById: async (invoiceId) => {
        const [rows] = await db.query(`
            SELECT hd.*, p.apartment_number 
            FROM invoices hd 
            LEFT JOIN apartments p ON hd.apartment_id = p.apartment_id
            WHERE hd.invoice_id = ?
        `, [invoiceId]);
        return rows[0];
    },

    getByApartment: async (apartmentId) => {
        const [rows] = await db.query(`
            SELECT hd.*, p.apartment_number 
            FROM invoices hd 
            LEFT JOIN apartments p ON hd.apartment_id = p.apartment_id
            WHERE hd.apartment_id = ? 
            ORDER BY hd.created_at DESC
        `, [apartmentId]);
        return rows;
    },

    getByTrangThai: async (status) => {
        const [rows] = await db.query('SELECT * FROM invoices WHERE status = ?', [status]);
        return rows;
    },

    create: async (data) => {
        const { invoice_id, apartment_id, billing_month, total_amount, status, created_at, due_date } = data;
        const [result] = await db.query(
            'INSERT INTO invoices (invoice_id, apartment_id, billing_month, total_amount, status, created_at, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [invoice_id, apartment_id, billing_month, total_amount || 0, status || 'Chưa thanh toán', created_at || new Date(), due_date]
        );
        return result.affectedRows;
    },

    update: async (invoiceId, data) => {
        const { total_amount, status, due_date } = data;
        const [result] = await db.query(
            'UPDATE invoices SET total_amount = ?, status = ?, due_date = ? WHERE invoice_id = ?',
            [total_amount, status, due_date, invoiceId]
        );
        return result.affectedRows;
    },

    updateTrangThai: async (invoiceId, status, paymentMethod) => {
        if (paymentMethod !== undefined) {
            const [result] = await db.query(
                'UPDATE invoices SET status = ?, payment_method = ? WHERE invoice_id = ?',
                [status, paymentMethod, invoiceId]
            );
            return result.affectedRows;
        }
        const [result] = await db.query('UPDATE invoices SET status = ? WHERE invoice_id = ?', [status, invoiceId]);
        return result.affectedRows;
    },

    delete: async (invoiceId) => {
        const [result] = await db.query('DELETE FROM invoices WHERE invoice_id = ?', [invoiceId]);
        return result.affectedRows;
    },

    calculateAndUpdateTotal: async (invoiceId) => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.unit_price
            FROM service_readings csdv
            LEFT JOIN services dv ON csdv.service_id = dv.service_id
            WHERE csdv.invoice_id = ?
        `, [invoiceId]);

        let total = 0;
        for (const item of rows) {
            const donGia = item.unit_price || 0;
            if (item.current_reading !== null && item.current_reading !== undefined && item.previous_reading !== null && item.previous_reading !== undefined) {
                const suDung = item.current_reading - item.previous_reading;
                if (suDung > 0) total += suDung * donGia;
            } else if (item.quantity !== null && item.quantity !== undefined) {
                total += item.quantity * donGia;
            } else {
                total += donGia;
            }
        }

        await db.query('UPDATE invoices SET total_amount = ? WHERE invoice_id = ?', [total, invoiceId]);
        return total;
    }
};

module.exports = HoaDonModel;
