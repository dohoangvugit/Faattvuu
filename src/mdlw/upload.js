const multer = require('multer');

// Chuyển sang memoryStorage để lưu tạm file trong RAM dưới dạng Buffer
const storage = multer.memoryStorage();

// Lọc loại file cho phép (giữ nguyên logic của bạn)
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload ảnh (JPEG, PNG, GIF, WebP)'), false);
    }
};

const uploadProductImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Hạn mức 5MB
    },
});

module.exports = uploadProductImage;