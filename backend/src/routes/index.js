const express = require('express');
const router = express.Router();

// Import cÃ¡c routes
const nguoiDungRoutes = require('./nguoiDungRoutes');
const phongRoutes = require('./phongRoutes');
const cuDanRoutes = require('./cuDanRoutes');
const hoaDonRoutes = require('./hoaDonRoutes');
const chiSoDichVuRoutes = require('./chiSoDichVuRoutes');
const suCoRoutes = require('./suCoRoutes');
const toaNhaRoutes = require('./toaNhaRoutes');
const danhSachDichVuRoutes = require('./danhSachDichVuRoutes');
const uploadRoutes = require('./uploadRoutes');

// Sá»­ dá»¥ng cÃ¡c routes
router.use('/nguoidung', nguoiDungRoutes);
router.use('/phong', phongRoutes);
router.use('/cudan', cuDanRoutes);
router.use('/hoadon', hoaDonRoutes);
router.use('/chisodichvu', chiSoDichVuRoutes);
router.use('/suco', suCoRoutes);
router.use('/toanha', toaNhaRoutes);
router.use('/danhsachdichvu', danhSachDichVuRoutes);
router.use('/upload', uploadRoutes);

// Route kiá»ƒm tra API
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Quáº£n lÃ½ chung cÆ° Ä‘ang hoáº¡t Ä‘á»™ng!',
        version: '2.0.0',
        endpoints: {
            nguoidung: '/api/nguoidung',
            phong: '/api/phong',
            cudan: '/api/cudan',
            hoadon: '/api/hoadon',
            chisodichvu: '/api/chisodichvu',
            suco: '/api/suco',
            toanha: '/api/toanha',
            danhsachdichvu: '/api/danhsachdichvu',
            upload: '/api/upload'
        }
    });
});

module.exports = router;
