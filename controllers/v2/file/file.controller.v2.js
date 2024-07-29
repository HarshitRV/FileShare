/**
 * Node modules.
 */
const fs = require("fs");

/**
 * Model import.
 */
const File = require("../../../models/file.model");

/**
 * Utils imports.
 */
const catchAsync = require("../../../utils/catchAsync");
const getTinyUrl = require("../../../utils/urlShortner");
/**
 * Constants
 */
const { MAX_FILE_SIZE } = require("../../../constants/constants");

/**
 * @description - This function is used to upload files.
 */
module.exports.uploadFileV2 = catchAsync(async (req, res, next) => {
	const origin = `${req.protocol}://${req.get("host")}`;

	const { password, uploadPin } = req.body;
	const fileData = req.file;

	if (!fileData) {
		return res.status(400).send({
			message: "No file found. Please upload a file.",
		});
	}

	if (fileData.size > MAX_FILE_SIZE) {
		if (!uploadPin) {
			return res.status(400).send({
				message: "Upload PIN required for files larger than 5Mb.",
			});
		}

		if (uploadPin !== process.env.UPLOAD_PIN) {
			return res.status(400).send({
				message: "Invalid upload PIN.",
			});
		}
	}

	// Check if file is already exists.
	const existingFile = await File.findOne({
		buffer: fileData.buffer,
	});

	if (existingFile) {
		const fileLink =
			existingFile.shortUrl || `${origin}/api/v2/file/${existingFile._id}`;
		return res.status(200).send({
			message: `File with name ${fileData.originalname} already exists`,
			longurl: `${origin}/api/v2/file/${existingFile._id}`,
			shorturl: fileLink,
			existingFile: true,
			isProtected: existingFile.protected,
		});
	}

	if (password) {
		fileData.password = password;
		fileData.protected = true;
	}

	const file = new File(fileData);

	let fileLink;
	// check if server is running in production mode.
	if (process.env.NODE_ENV === "production") {
		// then use getTinyUrl(shortens the URL).
		fileLink = await getTinyUrl(
			process.env.ACCESS_TOKEN,
			`${origin}/api/v2/file/${file._id}`
		);
		file.shortUrl = fileLink;
	} else {
		// else use the localhost url
		fileLink = `${origin}/api/v2/file/${file._id}`;
		file.longUrl = fileLink;
	}

	await file.save();

	return res.status(201).send({
		message: "Your file is uploaded",
		longurl: `${origin}/api/v2/file/${file._id}`,
		shorturl: fileLink,
		isProtected: file.protected,
		existingFile: false,
	});
});

/**
 * @description - V2 - This function is used to generate download link.
 *
 */
module.exports.genDownloadLinkV2 = catchAsync(async (req, res, _) => {
	const { id } = req.params;
	const file = await File.findById(id);

	if (!file)
		return res.status(404).send({
			message: "File not found",
		});

	if (file.password) {
		if (!req.query.password) {
			return res.status(400).send({
				message: "Password is required to download this file",
			});
		}

		const match = await file.checkPassword(req.query.password);
		if (!match) {
			return res.status(400).send({
				message: "Password is incorrect",
			});
		}
	}

	file.downloadCount += 1;
	await file.save();

	res.setHeader(
		"Content-Disposition",
		`attachment; filename="${file.originalname}"`
	);
	res.setHeader("Content-Type", file.mimetype);
	res.send(file.buffer);
});

/**
 * @description Gets file details.
 */
module.exports.getFileDetailsV2 = catchAsync(async (req, res) => {
	const { id } = req.query;
	if (!id) {
		return res.status(400).send({
			message: "Please provide file id",
		});
	}

	// check if file exists.
	const existingFile = await File.findById(id).select(
		"protected encoding size downloadCount createdAt"
	);
	if (!existingFile) {
		return res.status(400).send({
			message: "File does not exists",
		});
	}

	return res.status(200).send({
		fileDetails: existingFile,
	});
});

/**
 * @description This function is used to clear the uploads folder if it exists.
 */
module.exports.clearUploadsV2 = (req, res) => {
	if (fs.existsSync("./uploads")) {
		fs.rm("./uploads", { recursive: true }, (err) => {
			if (err) {
				return res.send({
					message: "Error while deleting uploads folder",
				});
			} else {
				return res.send({
					message: "Uploads folder deleted",
				});
			}
		});
	} else {
		return res.send({
			message: "Uploads folder does not exists",
		});
	}
};
