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
	hashKey,
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
		: `http://localhost:${process.env.PORT}`;

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

	if (existingUser && existingUser.registered) {
		return res.status(200).send({
			message: "user already exists, and registered",
			userExists: true,
		});
	}

	if (existingUser && !existingUser.registered) {
		return res.status(201).send({
			message: "successfully retrived stored keys",
			keys: existingUser.keys,
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

		const aesKey = randomKeyGen();
		const keys = {
			publicKey: publicKey.toString("utf-8"),
			privateKey: privateKey.toString("utf-8"),
			aesKey,
		};

		if (existingUser) {
			// updating the newly generated keys
			existingUser.keys = keys;
			await existingUser.save();
		} else {
			// creating new user
			const user = new User({
				publicAddress,
				keys,
			});
			await user.save();
		}
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
	const { senderAesKey: uploaderAesKey, receiverPublicKey } = req.body;
	const fileData = req.file;
	const fileBuffer = fileData.buffer;

	console.log("file buffer: ", fileBuffer);
	console.log("sender aes key: ", uploaderAesKey);
	console.log("receiver public key: ", receiverPublicKey);


	if (!publicAddress || !receiverAddress)
		return res.status(400).send({
			message: "Uploader and receiver wallet id is required",
		});

	const [uploader, receiver] = await Promise.all([
		User.findOne({
			publicAddress,
		}),
		User.findOne({
			publicAddress: receiverAddress,
		}),
	]);

	console.log(receiver);

	//! Will be used in future
	// if(!uploaderAesKey || !receiverPublicKey) {
	// 	return res.status(400).send({
	// 		message: "Sender aes key and receiver public key is required",
	// 	});
	// }	

	if (!fileData) {
		return res.status(400).send({
			message: "No file found.",
		});
	}

	if (fileData.size > 5000000) {
		return res.status(400).send({
			message: "File smaller than 5mb is only allowed",
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
	console.log(uploader.keys.aesKey);
	const encryptedBuffer = encryptBuffer(fileBuffer, uploader.keys.aesKey);

	// 2. encrypt the secret key with the recipient public key
	console.log(receiver.keys.publicKey);

	const encryptedSecretKey = encryptData(uploader.keys.aesKey, receiver.keys.publicKey);

	// 3. store the encrypted secret key along with the file
	const file = new File({
		...fileData,
		buffer: encryptedBuffer,
		secretKey: encryptedSecretKey,
	});

	let fileLink = "";
	if (process.env.NODE_ENV === "production") {
		// shortens the ur
		fileLink = await getTinyUrl(
			process.env.ACCESS_TOKEN,
			`${origin}/api/v1/crypt/file/${file._id}`
		);
		file.shortUrl = fileLink;
	}
	file.longUrl = `${origin}/api/v1/crypt/file/${file._id}`;

	await file.save();

	return res.status(201).send({
		message: "Securely uploaded file",
		longurl: `${origin}/api/v1/crypt/file/${file._id}`,
		shortUrl: fileLink,
	});
});

/**
 * @description Successfully registered user
 */
module.exports.registeredUser = catchAsync(async (req, res, next) => {
	const { success, publicAddress } = req.query;

	if (!success || !publicAddress)
		return res.status(400).send({
			message: "invalid address or missing query string",
		});

	const existingUser = await User.findOne({ publicAddress });

	if (!existingUser) {
		return res.status(200).send({
			message: "user doesn't exists",
			userExists: false,
		});
	}

	existingUser.registered = success;
	await existingUser.save();

	return res.status(200).send({
		message: "user registereat",
		registered: success,
	});
});

/**
 * @description get user keys from db
 */
module.exports.getKeys = catchAsync(async (req, res, next) => {
	const { publicAddress } = req.query;

	if (!publicAddress)
		return res.status(400).send({
			message: "invalid address or missing query string",
		});

	// Check first is user already exists
	const existingUser = await User.findOne({ publicAddress });

	if (!existingUser) {
		return res.status(200).send({
			message: "user doesn't exists",
			userExists: false,
		});
	}

	const { publicKey, privateKey, aesKey } = existingUser.keys;

	console.log(privateKey);

	console.log("private key hash", hashKey(privateKey));

	return res.status(200).send({
		message: "successfully retrived stored keys",
		keys: {
			publicKey,
			privateKey,
			aesKey,
		},
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

/**
 * Creates hash
 */
module.exports.createHash = catchAsync(async (req, res, next) => {
	const { key } = req.body;

	if (!key)
		return res.status(400).send({
			message: "invalid key",
		});

	const user = await User.findOne({ publicAddress: req.query.publicAddress });

	const { privateKey } = user.keys;

	const hash = hashKey(privateKey);

	return res.status(200).send({
		message: "hash created successfully",
		hash,
	});
});


/**
 * @description Verify if file is meant to download for the user
 */
module.exports.verifyFile = catchAsync(async (req, res, next) => {
	const { publicAddress: receiverAddress } = req.query;
	const { id } = req.params;

	if (!receiverAddress || !id)
		return res.status(400).send({
			message: "invalid address or missing query string",
			verified: false,
		});

		const [receiver, file] = await Promise.all([
			User.findOne({
				publicAddress: receiverAddress,
			}),
			File.findById(id),
		]);

		if (!receiver || !file)
			return res.status(400).send({
				message: "Wallet or file id is invalid",
				verified: false,
			});

		const receiverPrivateKey = receiver.keys.privateKey;

		const encryptedSecretKey = file.secretKey;

		try {
			const decryptedSecretKey = decryptData(
				encryptedSecretKey,
				receiverPrivateKey
			);
			console.log("decryptedSecretKey", decryptedSecretKey.toString("utf-8"));
			if(decryptedSecretKey) {
				return res.status(200).send({
					message: "authorized access",
					verified: true,
				});
			}
		} catch (e) {
			return res.status(400).send({
				message: "unauthorized access",
				verified: false,
			});
		}
});