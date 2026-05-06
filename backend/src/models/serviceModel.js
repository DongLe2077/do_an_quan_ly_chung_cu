const db = require('../config/db.config');

const DanhSachDichVuModel = {
    // Lấy tất cả dịch vụ
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM services');
        return rows;
    },

    // Lấy dịch vụ theo service_id
    getById: async (serviceId) => {
        const [rows] = await db.query('SELECT * FROM services WHERE service_id = ?', [serviceId]);
        return rows[0];
    },

    // Tạo dịch vụ mới
    create: async (data) => {
        const { service_id, service_name, unit_price, unit, service_type } = data;
        const [result] = await db.query(
            'INSERT INTO services (service_id, service_name, unit_price, unit, service_type) VALUES (?, ?, ?, ?, ?)',
            [service_id, service_name, unit_price || 0, unit || null, service_type || 1]
        );
        return result.affectedRows;
    },

    // Cập nhật dịch vụ
    update: async (serviceId, data) => {
        const { service_name, unit_price, unit, service_type } = data;
        const [result] = await db.query(
            'UPDATE services SET service_name = ?, unit_price = ?, unit = ?, service_type = ? WHERE service_id = ?',
            [service_name, unit_price, unit, service_type, serviceId]
        );
        return result.affectedRows;
    },

    // Xóa dịch vụ
    delete: async (serviceId) => {
        const [result] = await db.query('DELETE FROM services WHERE service_id = ?', [serviceId]);
        return result.affectedRows;
    }
};

module.exports = DanhSachDichVuModel;
