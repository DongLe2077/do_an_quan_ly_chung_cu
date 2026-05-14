const db = require('../config/db.config');

const ChiSoDichVuModel = {
    // Lấy tất cả chỉ số dịch vụ
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.service_name, dv.unit_price, dv.service_type, dv.unit,
                   hd.invoice_id as invoice_id_ref, hd.billing_month, p.apartment_number
            FROM service_readings csdv 
            LEFT JOIN services dv ON csdv.service_id = dv.service_id
            LEFT JOIN invoices hd ON csdv.invoice_id = hd.invoice_id
            LEFT JOIN apartments p ON hd.apartment_id = p.apartment_id
            ORDER BY csdv.reading_date DESC
        `);
        return rows;
    },

    getAllPaginated: async (limit, offset) => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.service_name, dv.unit_price, dv.service_type, dv.unit,
                   hd.invoice_id as invoice_id_ref, hd.billing_month, p.apartment_number
            FROM service_readings csdv 
            LEFT JOIN services dv ON csdv.service_id = dv.service_id
            LEFT JOIN invoices hd ON csdv.invoice_id = hd.invoice_id
            LEFT JOIN apartments p ON hd.apartment_id = p.apartment_id
            ORDER BY csdv.reading_date DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
        return rows;
    },

    count: async () => {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM service_readings');
        return rows[0].total;
    },

    // Lấy chỉ số dịch vụ theo reading_id
    getById: async (readingId) => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.service_name, dv.unit_price, dv.service_type
            FROM service_readings csdv 
            LEFT JOIN services dv ON csdv.service_id = dv.service_id
            LEFT JOIN invoices hd ON csdv.invoice_id = hd.invoice_id
            WHERE csdv.reading_id = ?
        `, [readingId]);
        return rows[0];
    },

    // Lấy chỉ số theo hóa đơn
    getByInvoice: async (invoiceId) => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.service_name, dv.unit_price, dv.service_type
            FROM service_readings csdv
            LEFT JOIN services dv ON csdv.service_id = dv.service_id
            WHERE csdv.invoice_id = ?
        `, [invoiceId]);
        return rows;
    },

    // Lấy chỉ số theo ngày ghi
    getByNgayGhi: async (readingDate) => {
        const [rows] = await db.query(`
            SELECT csdv.*, dv.service_name, dv.unit_price, dv.service_type
            FROM service_readings csdv
            LEFT JOIN services dv ON csdv.service_id = dv.service_id
            WHERE csdv.reading_date = ?
        `, [readingDate]);
        return rows;
    },

    // Tạo chỉ số mới
    create: async (data) => {
        const { reading_id, service_id, invoice_id, previous_reading, current_reading, quantity, reading_date } = data;
        const [result] = await db.query(
            'INSERT INTO service_readings (reading_id, service_id, invoice_id, previous_reading, current_reading, quantity, reading_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [reading_id, service_id || null, invoice_id || null, previous_reading !== undefined ? previous_reading : null, current_reading !== undefined ? current_reading : null, quantity !== undefined ? quantity : null, reading_date]
        );
        return result.affectedRows;
    },

    // Cập nhật chỉ số
    update: async (readingId, data) => {
        const { service_id, invoice_id, previous_reading, current_reading, quantity, reading_date } = data;
        const [result] = await db.query(
            'UPDATE service_readings SET service_id = ?, invoice_id = ?, previous_reading = ?, current_reading = ?, quantity = ?, reading_date = ? WHERE reading_id = ?',
            [service_id, invoice_id, previous_reading, current_reading, quantity, reading_date, readingId]
        );
        return result.affectedRows;
    },

    // Xóa chỉ số
    delete: async (readingId) => {
        const [result] = await db.query('DELETE FROM service_readings WHERE reading_id = ?', [readingId]);
        return result.affectedRows;
    }
};

module.exports = ChiSoDichVuModel;
