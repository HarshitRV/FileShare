/**
 * Node modules.
 */
const fs = require("fs");

/**
 * Model import.
 */
const File = require("../../models/file.model");

/**
 * Utils imports.
 */
const catchAsync = require("../../utils/catchAsync");
const getTinyUrl = require("../../utils/urlShortner");
const deleteUploads = require("../../utils/deleteUploads");

/**
 * @description - This function is used to upload files.
 */
module.exports.uploadFile = catchAsync(async (req, res, next) => {
	const { password, uploadPin } = req.body;
	const fileData = req.file;

	if (fileData.size > 1000000) {
		if (!uploadPin) {
			req.flash(
				"error",
				"File size is too large. Upload pin is required to upload files greater than 1MB."
			);
			return res.redirect("/");
		}

		if (uploadPin !== process.env.UPLOAD_PIN) {
			req.flash("error", "Expired upload pin.");
			return res.redirect("/");
		}
	}

	// Check if file is already exists.
	const existingFile = await File.findOne({
		originalname: fileData.originalname,
	});

	if (existingFile) {
		const fileLink = existingFile.shortUrl || existingFile.longUrl;

		return res.render("home", {
			message: `File with name ${fileData.originalname} already exists at ⬇️`,
			fileLink,
		});
	}

	if (password != null && password != "") {
		fileData.password = password;
	}

	const file = new File(fileData);

    // need a try catch over here in case request to tinyurl fails
	let fileLink = `${req.headers.origin}/file/${file._id}`;
	if (process.env.NODE_ENV === "production") {
		file.shortUrl = await getTinyUrl(
			process.env.ACCESS_TOKEN,
			`${req.headers.origin}/file/${file._id}`
		);
        fileLink = file.shortUrl;
        file.longUrl = `${req.headers.origin}/file/${file._id}`;
	} else {
		file.longUrl = `${req.headers.origin}/file/${file._id}`;
	}

	await file.save();

	return res.render("home", {
		message: "Your file is uploaded to",
		fileLink,
	});
});

/**
 * @description -  This function is used to generate download link.
 *
 */
module.exports.genDownloadLink = catchAsync(async (req, res, _) => {
	const { file, downloadPath, originalname } = req;

	if (file.password != null) {
		if (req.body.password == null) {
			req.flash("error", "Password is required to download this file.");
			return res.render("password");
		} else {
			const match = await file.checkPassword(req.body.password);
			if (!match) {
				req.flash("error", "Password is incorrect.");
				return res.render("password");
			}

			file.downloadCount += 1;
			await file.save();

			setTimeout(deleteUploads, 5000);

			return res.download(downloadPath, originalname);
		}
	}

	file.downloadCount += 1;
	await file.save();

	setTimeout(deleteUploads, 5000);

	return res.download(downloadPath, originalname);
});

/**
 * @description - This function is used to clear the uploads folder if it exists.
 */
module.exports.clearUploads = (req, res) => {
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
