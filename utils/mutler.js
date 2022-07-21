const multer = require("multer");
const storage = multer.memoryStorage();
const multerConfigs = {
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {            
        if (!file.originalname.match(/\.(pdf|doc|docx|txt|zip|pptx)$/)) {
            return cb(new Error("Supported file types are pdf, doc, docx and txt"));
        }
        cb(undefined, true);
    },
    storage
}

module.exports.upload = multer(multerConfigs);