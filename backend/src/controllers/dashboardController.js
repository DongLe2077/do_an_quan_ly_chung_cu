const db = require('../config/db.config');
const { formatResponse } = require('../utils/responseFormat');

const dashboardController = {
  getStats: async (req, res) => {
    try {
      // Execute all simple counts in parallel for performance
      const [
        [buildingsResult],
        [apartmentsResult],
        [residentsResult],
        [incidentsResult],
        [invoicesResult],
        [revenueResult],
      ] = await Promise.all([
        db.query('SELECT COUNT(*) as total FROM buildings'),
        db.query('SELECT COUNT(*) as total FROM apartments'),
        db.query('SELECT COUNT(*) as total FROM residents'),
        db.query(`SELECT COUNT(*) as total FROM incidents WHERE status IN ('Chờ duyệt', 'Đang xử lý')`),
        db.query(`SELECT 
                    SUM(CASE WHEN status = 'Đã thanh toán' THEN 1 ELSE 0 END) as paid,
                    SUM(CASE WHEN status = 'Chưa thanh toán' THEN 1 ELSE 0 END) as unpaid
                  FROM invoices`),
        db.query(`SELECT SUM(total_amount) as total FROM invoices WHERE status = 'Đã thanh toán'`),
      ]);

      const [recentIncidents] = await db.query(`
        SELECT sc.*, p.apartment_number 
        FROM incidents sc 
        LEFT JOIN apartments p ON sc.apartment_id = p.apartment_id
        ORDER BY sc.created_at DESC 
        LIMIT 3
      `);

      const [recentResidents] = await db.query(`
        SELECT cd.*, p.apartment_number 
        FROM residents cd 
        LEFT JOIN apartments p ON cd.apartment_id = p.apartment_id
        ORDER BY cd.created_at DESC 
        LIMIT 3
      `);

      const stats = {
        totalBuildings: buildingsResult[0].total,
        totalApartments: apartmentsResult[0].total,
        totalResidents: residentsResult[0].total,
        pendingIncidents: incidentsResult[0].total,
        totalRevenue: revenueResult[0].total || 0,
        invoiceStats: {
          paid: invoicesResult[0].paid || 0,
          unpaid: invoicesResult[0].unpaid || 0,
        },
        recentIncidents,
        recentResidents
      };

      res.status(200).json(formatResponse(true, stats, 'Lấy thống kê thành công'));
    } catch (error) {
      console.error('Lỗi API Dashboard Stats:', error);
      res.status(500).json(formatResponse(false, null, 'Lỗi server khi lấy thống kê'));
    }
  }
};

module.exports = dashboardController;
