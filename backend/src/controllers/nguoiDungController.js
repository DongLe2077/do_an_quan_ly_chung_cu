const NguoiDungModel = require('../models/nguoiDungModel');
const response = require('../utils/responseFormat');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Hàm tạo mã tự động
const generateId = () => 'ND' + Date.now();

const NguoiDungController = {
    // Đăng nhập
    login: async (req, res) => {
        try {
            const { TenDangNhap, MatKhau } = req.body;
            
            if (!TenDangNhap || !MatKhau) {
                return response.error(res, 'Tên đăng nhập và mật khẩu là bắt buộc', 400);
            }
            
            const user = await NguoiDungModel.getByUsername(TenDangNhap);
            if (!user) {
                return response.error(res, 'Tên đăng nhập hoặc mật khẩu không đúng', 401);
            }
            
            const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
            if (!isMatch) {
                return response.error(res, 'Tên đăng nhập hoặc mật khẩu không đúng', 401);
            }
            
            const token = jwt.sign(
                { MaNguoiDung: user.MaNguoiDung, VaiTro: user.VaiTro },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );
            
            const { MatKhau: _, ...userWithoutPassword } = user;
            return response.success(res, { user: userWithoutPassword, token }, 'Đăng nhập thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Đăng ký
    register: async (req, res) => {
        try {
            const { TenDangNhap, MatKhau, VaiTro, Email } = req.body;
            
            if (!TenDangNhap || !MatKhau) {
                return response.error(res, 'Tên đăng nhập và mật khẩu là bắt buộc', 400);
            }
            
            const existingUser = await NguoiDungModel.getByUsername(TenDangNhap);
            if (existingUser) {
                return response.error(res, 'Tên đăng nhập đã tồn tại', 400);
            }
            
            const hashedPassword = await bcrypt.hash(MatKhau, 10);
            
            const MaNguoiDung = generateId();
            await NguoiDungModel.create({
                MaNguoiDung,
                TenDangNhap,
                MatKhau: hashedPassword,
                VaiTro: VaiTro || 'cudan',
                TrangThai: 'Hoạt động',
                Email
            });
            
            return response.success(res, { MaNguoiDung }, 'Đăng ký thành công', 201);
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

    // Lấy người dùng theo MaNguoiDung
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await NguoiDungModel.getById(id);
            
            if (!data) {
                return response.error(res, 'Không tìm thấy người dùng', 404);
            }
            
            return response.success(res, data, 'Lấy thông tin người dùng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Cập nhật người dùng
    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { VaiTro, TrangThai, Email } = req.body;
            
            const existing = await NguoiDungModel.getById(id);
            if (!existing) {
                return response.error(res, 'Không tìm thấy người dùng', 404);
            }
            
            VaiTro = VaiTro !== undefined ? VaiTro : existing.VaiTro;
            TrangThai = TrangThai !== undefined ? TrangThai : existing.TrangThai;
            Email = Email !== undefined ? Email : existing.Email;
            
            await NguoiDungModel.update(id, { VaiTro, TrangThai, Email });
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
            if (!existing) {
                return response.error(res, 'Không tìm thấy người dùng', 404);
            }
            
            await NguoiDungModel.delete(id);
            return response.success(res, null, 'Xóa người dùng thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Lấy thông tin profile
    getProfile: async (req, res) => {
        try {
            const MaNguoiDung = req.user?.MaNguoiDung;
            
            if (!MaNguoiDung) {
                return response.error(res, 'Không tìm thấy thông tin người dùng', 401);
            }
            
            const data = await NguoiDungModel.getById(MaNguoiDung);
            if (!data) {
                return response.error(res, 'Không tìm thấy người dùng', 404);
            }
            
            return response.success(res, data, 'Lấy thông tin profile thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    // Đổi mật khẩu
    changePassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { MatKhauCu, MatKhauMoi } = req.body;
            
            if (!MatKhauCu || !MatKhauMoi) {
                return response.error(res, 'Mật khẩu cũ và mật khẩu mới là bắt buộc', 400);
            }
            
            if (MatKhauMoi.length < 6) {
                return response.error(res, 'Mật khẩu mới phải có ít nhất 6 ký tự', 400);
            }
            
            const user = await NguoiDungModel.getByIdWithPassword(id);
            if (!user) {
                return response.error(res, 'Không tìm thấy người dùng', 404);
            }
            
            const isMatch = await bcrypt.compare(MatKhauCu, user.MatKhau);
            if (!isMatch) {
                return response.error(res, 'Mật khẩu cũ không đúng', 400);
            }
            
            const hashedPassword = await bcrypt.hash(MatKhauMoi, 10);
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
            const { VaiTro } = req.body;
            
            const validRoles = ['admin', 'cudan', 'kythuat'];
            if (!VaiTro || !validRoles.includes(VaiTro)) {
                return response.error(res, 'VaiTro không hợp lệ. Chọn: admin, cudan, kythuat', 400);
            }
            
            const existing = await NguoiDungModel.getById(id);
            if (!existing) {
                return response.error(res, 'Không tìm thấy người dùng', 404);
            }
            
            await NguoiDungModel.updateRole(id, VaiTro);
            return response.success(res, null, `Đã cập nhật quyền thành: ${VaiTro}`);
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = NguoiDungController;
