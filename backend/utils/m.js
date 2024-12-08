const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
        cb(null, uploadPath); // Save files to "uploads" directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// Multer instance with file size limits
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit files to 5MB
});

module.exports = upload;
