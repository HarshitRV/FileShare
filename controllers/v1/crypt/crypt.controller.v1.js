/**
 * Node modules
 */
const fs = require("fs");
const { promisify } = require("util");

/**
 * Utils imports
 */
const catchAsync = require("../../../utils/catchAsync");
const { genKeyPairs } = require("../../../utils/crypt/openssl");
const {
	encryptData,
	decryptData,
	encryptBuffer,
	decryptBuffer,
} = require("../../../utils/crypt/crypt");
const { randomKeyGen } = require("../../../utils/randomKeyGen");
const getTinyUrl = require("../../../utils/urlShortner");
const deleteUploads = require("../../../utils/deleteUploads");

/**
 * Models imports
 */
const User = require("../../../models/user.model");
const File = require("../../../models/file.model");

/**
 * Globals
 */
const readFile = promisify(fs.readFile);
const origin =
	process.env.NODE_ENV === "production"
		? "https://securesharedapp.onrender.com"
		: "http://localhost:3000";

/**
 * @description - Generates public private key pairs
 */
module.exports.createKeyPairs = catchAsync(async (req, res, next) => {
	const { publicAddress } = req.query;

	if (!publicAddress)
		return res.status(400).send({
			message: "invalid address or missing query string",
		});

	// Check first is user already exists
	const existingUser = await User.findOne({
		publicAddress: req.query.publicAddress,
	});

	if (existingUser) {
		return res.status(200).send({
			message: "user already exists",
			userExists: true,
		});
	}

	const isKeysCreated = await genKeyPairs();
	if (isKeysCreated) {
		let privateKey, publicKey;
		if (fs.existsSync("./openssl")) {
			[privateKey, publicKey] = await Promise.all([
				readFile("./openssl/private_key.pem"),
				readFile("./openssl/public_key.pem"),
			]);
		}

		const publicAddress = req.query.publicAddress;

		const secretKey = randomKeyGen();
		const keys = {
			publicKey: publicKey.toString("utf-8"),
			privateKey: privateKey.toString("utf-8"),
			aesKey: secretKey,
		};

		// this will be changes to store only the public
		// key of the new user
		const user = new User({
			publicAddress,
			keys,
		});
		await user.save();

		// TODO
		// 1. Now the openssl directory should be deleted ✅
		if (fs.existsSync("./openssl")) {
			fs.rm("./openssl", { recursive: true }, (err) => {
				if (err) console.error(err);
			});
		}
		// 2. Also it should be created seperately in some other folder based on the user public key.

		return res.status(201).send({
			message: "successfully created keys",
			keys,
		});
	}
	return res.status(500).send({
		message: "something went wrong",
	});
});

/**
 * @description - Encrypts and uploads the file to the server
 */
module.exports.encryptFile = catchAsync(async (req, res, next) => {
	const { publicAddress, receiverAddress } = req.query;
	const fileData = req.file;
	const fileBuffer = fileData.buffer;

	if (!publicAddress || !receiverAddress)
		return res.status(400).send({
			message: "Uploader and receiver wallet id is required",
		});

	const [uploader, receiver] = await Promise.all([
		User.findOne({ publicAddress }),
		User.findOne({ publicAddress: receiverAddress }),
	]);

	if (!uploader || !receiver)
		return res.status(400).send({
			message: "Uploader or receiver doesn't exists",
		});

	if (!fileData) {
		return res.status(400).send({
			message: "No file found.",
		});
	}

	if (fileData.size > 1000000) {
		return res.status(400).send({
			message: "File smaller than 1mb is only allowed",
		});
	}

	const existingFile = await File.findOne({
		originalname: fileData.originalname,
	});

	if (existingFile) {
		const fileLink = existingFile.shortUrl;

		return res.status(200).send({
			message: `File with name ${fileData.originalname} already exists`,
			longurl: `${origin}/api/crypt/v1/file/${existingFile._id}`,
			shortUrl: fileLink,
		});
	}
	// Reached this far means new file is being uploaded
	// Get the uploader secretAES key

	// TODO
	// 1. encrypt the buffer of the file with the uploader
	//    secret key
	const uploaderSecretKey = uploader.keys.secretKey;
	const receiverPublicKey = receiver.keys.publicKey;

	const encryptedBuffer = encryptBuffer(fileBuffer, uploaderSecretKey);

	// 2. encrypt the secret key with the recipient public key
	const encryptedSecretKey = encryptData(uploaderSecretKey, receiverPublicKey);

	const decryptedSecretKey = decryptData(
		encryptedSecretKey,
		receiver.keys.privateKey
	);

	// 3. store the encrypted secret key along with the file
	const file = new File({
		...fileData,
		buffer: encryptedBuffer,
		secretKey: encryptedSecretKey,
	});

	// So when reciver receive the file along with secretKey
	// he can decrypt the fileBuffer
	// this will be in seperate controller
	const decryptedBuffer = decryptBuffer(
		encryptedBuffer,
		decryptedSecretKey.toString("utf-8")
	);

	// Shortens the url.
	let fileLink = "";
	if (process.env.NODE_ENV === "production") {
		fileLink = await getTinyUrl(
			process.env.ACCESS_TOKEN,
			`${origin}/api/v1/crypt/file/${file._id}`
		);
		file.shortUrl = fileLink;
	}

	await file.save();

	return res.status(201).send({
		message: "Securely uploaded file",
		longurl: `${origin}/api/v1/crypt/file/${file._id}`,
		shortUrl: fileLink,
		protected: file.protected,
	});
});

/**
 * @description - Decrypts file and makes it available for download.
 */
module.exports.downloadFile = catchAsync(async (req, res, next) => {
	const { file, downloadPath, originalname } = req;
	file.downloadCount += 1;
	delete file.decryptedBuffer;
	await file.save();
	setTimeout(deleteUploads, 5000);
	return res.status(200).download(downloadPath, originalname);
});

/**
 * @description Deletes the user if it exists
 */
module.exports.deleteUser = catchAsync(async (req, res, next) => {
	const { publicAddress } = req.query;

	if (!publicAddress)
		return res.status(400).send({
			message: "invalid address or missing query string",
		});

	const existingUser = await User.findOne({
		publicAddress: req.query.publicAddress,
	});

	if (!existingUser) {
		return res.status(200).send({
			message: "user doesn't exists",
		});
	}

	await existingUser.remove();

	return res.status(200).send({
		message: "user deleted successfully",
	});
});
