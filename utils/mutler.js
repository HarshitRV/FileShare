const multer = require("multer");
const storage = multer.memoryStorage();
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const multerConfigs = {
	limits: {
		fileSize: MAX_FILE_SIZE,
	},
	fileFilter(req, file, cb) {
		if (
			!file.originalname.match(
				/\.(pdf|doc|docx|txt|zip|pptx|ppt|png|jpeg|jpg|gif|md|epub|odt|rtf)$/
			)
		) {
			return cb(new Error("Supported file types are pdf, doc, docx and txt"));
		}
		cb(undefined, true);
	},
	storage,
};

module.exports.upload = multer(multerConfigs);
module.exports.MAX_FILE_SIZE = MAX_FILE_SIZE;