/**
 * Node modules.
 */
const fs = require("fs");
const Readable = require("stream").Readable;

/**
 * Model import.
 */
const File = require("../models/file.model");

/**
 * Utils imports.
 */
const catchAsync = require("../utils/catchAsync");

/**
 * @description - This function reads the buffer data and generates the file.
 */
const genDownloadFile = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const file = await File.findById(id);

	if (!file)
		return res.status(404).send({
			message: "File not found",
		});

	const fileExtension = file.originalname.split(".").pop();

	const fileData = file.buffer;
	const readable = new Readable();
	readable.push(fileData);
	readable.push(null);

	if (!fs.existsSync("./uploads")) {
		fs.mkdirSync("./uploads");
	}

	if (
		!fs.existsSync(
			`./uploads/${file.originalname.split(".")[0]}.${fileExtension}`
		)
	) {
		const writeStream = fs.createWriteStream(
			`./uploads/${file.originalname.split(".")[0]}.${fileExtension}`
		);
		readable.pipe(writeStream);
	}

	req.file = file;
	req.downloadPath = `./uploads/${
		file.originalname.split(".")[0]
	}.${fileExtension}`;
	req.originalname = file.originalname;

	setTimeout(() => {
		next();
	}, 2000);
});

module.exports = genDownloadFile;
