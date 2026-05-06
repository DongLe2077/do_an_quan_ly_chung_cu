const db = require('../config/db.config');

const NguoiDungModel = {
    // Lấy tất cả người dùng
    getAll: async () => {
        const [rows] = await db.query('SELECT user_id, username, role, status, email FROM users');
        return rows;
    },

    // Lấy người dùng theo user_id
    getById: async (userId) => {
        const [rows] = await db.query(
            'SELECT user_id, username, role, status, email FROM users WHERE user_id = ?',
            [userId]
        );
        return rows[0];
    },

    // Lấy người dùng theo tên đăng nhập (dùng cho login)
    getByUsername: async (username) => {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    },

    // Tạo người dùng mới
    create: async (data) => {
        const { user_id, username, password, role, status, email } = data;
        const [result] = await db.query(
            'INSERT INTO users (user_id, username, password, role, status, email) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, username, password, role || 'cudan', status || 'Hoạt động', email || null]
        );
        return result.affectedRows;
    },

    // Cập nhật người dùng
    update: async (userId, data) => {
        const { role, status, email } = data;
        const [result] = await db.query(
            'UPDATE users SET role = ?, status = ?, email = ? WHERE user_id = ?',
            [role, status, email, userId]
        );
        return result.affectedRows;
    },

    // Cập nhật mật khẩu
    updatePassword: async (userId, password) => {
        const [result] = await db.query('UPDATE users SET password = ? WHERE user_id = ?', [password, userId]);
        return result.affectedRows;
    },

    // Cập nhật role (phân quyền)
    updateRole: async (userId, role) => {
        const [result] = await db.query('UPDATE users SET role = ? WHERE user_id = ?', [role, userId]);
        return result.affectedRows;
    },

    // Lấy user với mật khẩu (dùng cho đổi mật khẩu)
    getByIdWithPassword: async (userId) => {
        const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        return rows[0];
    },

    // Xóa người dùng
    delete: async (userId) => {
        const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
        return result.affectedRows;
    }
};

module.exports = NguoiDungModel;
