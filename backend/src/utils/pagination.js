// Phân trang (Pagination) helper
// Sử dụng: const { page, limit, offset } = parsePagination(req.query);

const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

// Kiểm tra xem request có yêu cầu phân trang không
const isPaginated = (query) => {
    return query.page !== undefined || query.limit !== undefined;
};

module.exports = { parsePagination, isPaginated };
