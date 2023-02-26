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
 * @description This function reads the buffer data and generates the file.
 */
const genDownloadFile = async (req, res, next) => {
	try {
		const { id } = req.params;

		// This line means that this middleare is being called by another
		// middleware with file data.
		let file = req.file;
		if (!file) file = await File.findById(id);

		if (!file)
			return res.status(404).send({
				message: "File not found",
			});

		const fileExtension = file.originalname.split(".").pop();

		// If req already has the file object then
		let fileData;
		if (file) {
			fileData = file.decryptedBuffer;
		} else {
			fileData = file.buffer;
		}

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

		//! sus
		if (!req.file) req.file = file;

		req.downloadPath = `./uploads/${
			file.originalname.split(".")[0]
		}.${fileExtension}`;
		req.originalname = file.originalname;

		setTimeout(() => {
			next();
		}, 2000);
	} catch (e) {
		next(e);
	}
};

module.exports = genDownloadFile;
