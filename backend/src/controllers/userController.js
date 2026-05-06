const NguoiDungModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const response = require('../utils/responseFormat');

const generateId = () => 'ND' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

const NguoiDungController = {
    // Đăng nhập
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return response.error(res, 'Tên đăng nhập và mật khẩu là bắt buộc', 400);
            }
            const user = await NguoiDungModel.getByUsername(username);
            if (!user) return response.error(res, 'Sai tên đăng nhập hoặc mật khẩu', 401);

            if (user.status === 'Bị khóa') {
                return response.error(res, 'Tài khoản đã bị khóa. Liên hệ Ban quản lý.', 403);
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return response.error(res, 'Sai tên đăng nhập hoặc mật khẩu', 401);

            const token = jwt.sign(
                { user_id: user.user_id, role: user.role },
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: '24h' }
            );

            return response.success(res, {
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role,
                    status: user.status,
                    email: user.email
                }
            }, 'Đăng nhập thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Đăng ký
    register: async (req, res) => {
        try {
            const { username, password, email } = req.body;
            if (!username || !password) {
                return response.error(res, 'Tên đăng nhập và mật khẩu là bắt buộc', 400);
            }

            const existing = await NguoiDungModel.getByUsername(username);
            if (existing) return response.error(res, 'Tên đăng nhập đã tồn tại', 409);

            const hashedPassword = await bcrypt.hash(password, 10);
            const user_id = generateId();

            await NguoiDungModel.create({
                user_id,
                username,
                password: hashedPassword,
                role: 'cudan',
                status: 'Hoạt động',
                email: email || null
            });

            const token = jwt.sign(
                { user_id, role: 'cudan' },
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: '24h' }
            );

            return response.success(res, {
                token,
                user: { user_id, username, role: 'cudan', status: 'Hoạt động', email }
            }, 'Đăng ký thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Lấy tất cả người dùng
    getAll: async (req, res) => {
        try {
            const data = await NguoiDungModel.getAll();
            return response.success(res, data, 'Lấy danh sách người dùng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Lấy người dùng theo ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await NguoiDungModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy người dùng', 404);
            return response.success(res, data, 'Lấy thông tin người dùng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Lấy profile user đang đăng nhập
    getProfile: async (req, res) => {
        try {
            const userId = req.user.user_id;
            const data = await NguoiDungModel.getById(userId);
            if (!data) return response.error(res, 'Không tìm thấy người dùng', 404);
            return response.success(res, data, 'Lấy profile thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Cập nhật người dùng
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { role, status, email } = req.body;

            const existing = await NguoiDungModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy người dùng', 404);

            await NguoiDungModel.update(id, {
                role: role !== undefined ? role : existing.role,
                status: status !== undefined ? status : existing.status,
                email: email !== undefined ? email : existing.email
            });

            return response.success(res, null, 'Cập nhật người dùng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Xóa người dùng
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await NguoiDungModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy người dùng', 404);

            await NguoiDungModel.delete(id);
            return response.success(res, null, 'Xóa người dùng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Đổi mật khẩu
    changePassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return response.error(res, 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc', 400);
            }

            const user = await NguoiDungModel.getByIdWithPassword(id);
            if (!user) return response.error(res, 'Không tìm thấy người dùng', 404);

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return response.error(res, 'Mật khẩu hiện tại không đúng', 400);

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await NguoiDungModel.updatePassword(id, hashedPassword);
            return response.success(res, null, 'Đổi mật khẩu thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Set role
    setRole: async (req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!role) return response.error(res, 'Vai trò là bắt buộc', 400);

            const existing = await NguoiDungModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy người dùng', 404);

            await NguoiDungModel.updateRole(id, role);
            return response.success(res, null, 'Cập nhật vai trò thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = NguoiDungController;
