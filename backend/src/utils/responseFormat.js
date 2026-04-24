// Chuẩn hóa response trả về cho frontend

const responseFormat = {
    // Response thành công
    success: (res, data = null, message = 'Thành công', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    },

    // Response lỗi
    error: (res, message = 'Có lỗi xảy ra', statusCode = 500, errors = null) => {
        return res.status(statusCode).json({
            success: false,
            message,
            errors
        });
    },

    // Response phân trang
    paginate: (res, data, page, limit, total, message = 'Thành công') => {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
};

module.exports = responseFormat;
