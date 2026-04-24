const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Chỉ hỗ trợ định dạng ảnh (jpeg, jpg, png, webp)"));
    }
});

// Route POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'Vui lòng chọn file' });
    }
    
    // Trả về URL tương đối để lưu vào DB
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
        status: 'success',
        url: imageUrl
    });
});

module.exports = router;
