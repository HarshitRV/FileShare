const multer = require("multer");

const multerConfigs = {
    dest: 'uploads/',
    limits: {
        fileSize: 1500000
    },
    fileFilter(req, file, cb) {            
        if (!file.originalname.match(/\.(pdf|doc|docx|txt)$/)) {
            return cb(new Error("Supported file types are pdf, doc, docx and txt"));
        }
        cb(undefined, true);
    }
}

module.exports.upload = multer(multerConfigs);