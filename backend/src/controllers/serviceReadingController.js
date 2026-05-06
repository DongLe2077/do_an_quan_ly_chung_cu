const ChiSoDichVuModel = require('../models/serviceReadingModel');
const HoaDonModel = require('../models/invoiceModel');
const response = require('../utils/responseFormat');

const generateId = () => 'CS' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

const ChiSoDichVuController = {
    getAll: async (req, res) => {
        try {
            const data = await ChiSoDichVuModel.getAll();
            return response.success(res, data, 'Lấy danh sách chỉ số dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await ChiSoDichVuModel.getById(id);
            if (!data) return response.error(res, 'Không tìm thấy chỉ số dịch vụ', 404);
            return response.success(res, data, 'Lấy thông tin chỉ số dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByInvoice: async (req, res) => {
        try {
            const { invoice_id } = req.params;
            const data = await ChiSoDichVuModel.getByInvoice(invoice_id);
            return response.success(res, data, 'Lấy danh sách chỉ số theo hóa đơn thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    getByNgayGhi: async (req, res) => {
        try {
            const { reading_date } = req.params;
            const data = await ChiSoDichVuModel.getByNgayGhi(reading_date);
            return response.success(res, data, 'Lấy danh sách chỉ số theo ngày ghi thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    create: async (req, res) => {
        try {
            let { service_id, invoice_id, previous_reading, current_reading, quantity, reading_date } = req.body;
            if (!service_id) return response.error(res, 'Mã dịch vụ là bắt buộc', 400);

            // Tự động tính quantity nếu có chỉ số trước/sau
            if (current_reading !== undefined && previous_reading !== undefined) {
                quantity = current_reading - previous_reading;
            }

            const reading_id = generateId();
            await ChiSoDichVuModel.create({
                reading_id, service_id, invoice_id,
                previous_reading, current_reading, quantity, reading_date
            });

            // Tự động tính lại tổng tiền hoá đơn nếu có invoice_id
            if (invoice_id) {
                await HoaDonModel.calculateAndUpdateTotal(invoice_id);
            }

            return response.success(res, { reading_id }, 'Tạo chỉ số dịch vụ thành công', 201);
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            let { service_id, invoice_id, previous_reading, current_reading, quantity, reading_date } = req.body;

            const existing = await ChiSoDichVuModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy chỉ số dịch vụ', 404);

            const finalPrev = previous_reading !== undefined ? previous_reading : existing.previous_reading;
            const finalCurr = current_reading !== undefined ? current_reading : existing.current_reading;

            if (finalCurr !== null && finalPrev !== null) {
                quantity = finalCurr - finalPrev;
            }

            await ChiSoDichVuModel.update(id, {
                service_id: service_id || existing.service_id,
                invoice_id: invoice_id !== undefined ? invoice_id : existing.invoice_id,
                previous_reading: finalPrev,
                current_reading: finalCurr,
                quantity: quantity !== undefined ? quantity : existing.quantity,
                reading_date: reading_date || existing.reading_date
            });

            // Tự động tính lại tổng tiền cho hoá đơn cũ và hoá đơn mới
            if (existing.invoice_id) await HoaDonModel.calculateAndUpdateTotal(existing.invoice_id);
            if (invoice_id && invoice_id !== existing.invoice_id) await HoaDonModel.calculateAndUpdateTotal(invoice_id);

            return response.success(res, null, 'Cập nhật chỉ số dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await ChiSoDichVuModel.getById(id);
            if (!existing) return response.error(res, 'Không tìm thấy chỉ số dịch vụ', 404);

            await ChiSoDichVuModel.delete(id);

            // Tự động tính lại tổng tiền hoá đơn sau khi xoá
            if (existing.invoice_id) {
                await HoaDonModel.calculateAndUpdateTotal(existing.invoice_id);
            }

            return response.success(res, null, 'Xóa chỉ số dịch vụ thành công');
        } catch (error) {
            return response.error(res, error.message);
        }
    }
};

module.exports = ChiSoDichVuController;
