import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define the destination directory
const uploadDir = path.join(process.cwd(), 'images');

// Ensuring the destination directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

const imgStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + suffix + extension);
    }
});

const upload = multer({
    storage: imgStorage
});

export default upload;