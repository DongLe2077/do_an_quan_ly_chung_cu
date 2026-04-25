const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Sử dụng memoryStorage để xử lý ảnh bằng sharp trước khi lưu
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Tăng lên 10MB để nhận ảnh gốc từ camera điện thoại
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

// Hàm nén ảnh
const processImage = async (buffer) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '.webp';
    const uploadsDir = path.join(__dirname, '../public/uploads');
    
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const outputPath = path.join(uploadsDir, filename);

    await sharp(buffer)
        .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

    return `/uploads/${filename}`;
};

// Route POST /api/upload (Single file)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'Vui lòng chọn file' });
        }

        const imageUrl = await processImage(req.file.buffer);
        res.json({
            status: 'success',
            url: imageUrl
        });
    } catch (error) {
        console.error('Lỗi xử lý ảnh:', error);
        res.status(500).json({ status: 'error', message: 'Lỗi nén ảnh' });
    }
});

// Route POST /api/upload/multiple (Multiple files)
router.post('/multiple', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Vui lòng chọn file' });
        }

        const uploadPromises = req.files.map(file => processImage(file.buffer));
        const imageUrls = await Promise.all(uploadPromises);

        res.json({
            status: 'success',
            urls: imageUrls
        });
    } catch (error) {
        console.error('Lỗi xử lý nhiều ảnh:', error);
        res.status(500).json({ status: 'error', message: 'Lỗi nén ảnh' });
    }
});

module.exports = router;
