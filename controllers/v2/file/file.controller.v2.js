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
const deleteUploads = require("../../../utils/deleteUploads");

/**
 * Globals.
 */
const origin =
	process.env.NODE_ENV === "production"
		? "https://fileshare-fikr.onrender.com"
		: "http://localhost:3000";

/**
 * @description - This function is used to upload files.
 */
module.exports.uploadFileV2 = catchAsync(async (req, res, next) => {
	const { password, uploadPin } = req.body;
	const fileData = req.file;

	console.log("req.file data: ", fileData);
	console.log(typeof fileData.buffer);
	console.log(fileData.buffer);

	if (!fileData) {
		return res.status(400).send({
			message: "No file found. Please upload a file",
		});
	}

	if (fileData.size > 1000000) {
		if (!uploadPin) {
			return res.status(400).send({
				message: "Upload PIN required for files larger than 10Mb",
			});
		}

		if (uploadPin !== process.env.UPLOAD_PIN) {
			return res.status(400).send({
				message: "Upload PIN required for files larger than 10Mb",
			});
		}
	}

	// Check if file is already exists.
	const existingFile = await File.findOne({
		originalname: fileData.originalname,
	});

	if (existingFile) {
		const fileLink = existingFile.shortUrl;

		return res.status(200).send({
			message: `File with name ${fileData.originalname} already exists`,
			longurl: `${origin}/api/v2/file/${existingFile._id}`,
			shortUrl: fileLink,
		});
	}

	if (password != null && password != "") {
		fileData.password = password;
		fileData.protected = true;
	}

	const file = new File(fileData);

	// Shortens the url.
	let fileLink = "";
	if (process.env.NODE_ENV === "production") {
        //! this was changed.
		fileLink = await getTinyUrl(
			process.env.ACCESS_TOKEN,
			`${origin}/api/v2/file/${file._id}`
		);
		file.shortUrl = fileLink;
	}

	await file.save();

	return res.status(201).send({
		message: "Your file is uploaded",
		longurl: `${origin}/api/v2/file/${file._id}`,
		shortUrl: fileLink,
		protected: file.protected,
	});
});

/**
 * @description - V2 - This function is used to generate download link.
 *
 */
module.exports.genDownloadLinkV2 = catchAsync(async (req, res, _) => {
	const { file, downloadPath, originalname } = req;

	if (file.password != null) {
		if (req.query.password == null) {
			return res.status(400).send({
				message: "Password is required to download this file",
			});
		} else {
			const match = await file.checkPassword(req.query.password);
			if (!match) {
				return res.status(400).send({
					message: "Password is incorrect",
				});
			}

			file.downloadCount += 1;
			await file.save();

			setTimeout(deleteUploads, 5000);

			return res.status(200).download(downloadPath, originalname);
		}
	}

	file.downloadCount += 1;

	await file.save();

	setTimeout(deleteUploads, 5000);

	return res.status(200).download(downloadPath, originalname);
});

/**
 * @description - This function is used to clear the uploads folder if it exists.
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
