const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary (nếu có)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
    // 1. Nén ảnh bằng sharp
    const compressedBuffer = await sharp(buffer)
        .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();

    // 2. Nếu có cấu hình Cloudinary, đẩy thẳng lên Cloud
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'quanlychungcu', format: 'webp' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url); // Trả về link ảnh thật trên mạng
                }
            );
            uploadStream.end(compressedBuffer);
        });
    }

    // 3. (Fallback) Lưu vào máy tính nếu đang chạy localhost
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '.webp';
    const uploadsDir = path.join(__dirname, '../public/uploads');
    
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const outputPath = path.join(uploadsDir, filename);
    fs.writeFileSync(outputPath, compressedBuffer);

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
