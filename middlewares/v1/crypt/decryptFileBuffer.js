/**
 * Model Imports.
 */
const File = require("../../../models/file.model");
const User = require("../../../models/user.model");

/**
 * Utils Imports.
 */
const { decryptData, decryptBuffer } = require("../../../utils/crypt/crypt");

/**
 * @description This middleware function decrypts the file buffer based on receivers private key.
 */
const decryptFileBuffer = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { publicAddress: receiverAddress } = req.query;

		const [receiver, file] = await Promise.all([
			User.findOne({
				publicAddress: receiverAddress,
			}),
			File.findById(id),
		]);

		if (!receiver || !file)
			return res.status(400).send({
				message: "Wallet or file id is invalid",
			});

		const encryptedFileBuffer = file.buffer;
		const receiverPrivateKey = receiver.keys.privateKey;
		const encryptedSecretKey = file.secretKey;

		const decryptedSecretKey = decryptData(
			encryptedSecretKey,
			receiverPrivateKey
		);

		const decryptedBuffer = decryptBuffer(
			encryptedFileBuffer,
			decryptedSecretKey.toString("utf-8")
		);

		console.log("success 🚀");
		file.decryptedBuffer = decryptedBuffer;
		req.file = file;

		next();
	} catch (e) {
		next(e);
	}
};

module.exports = decryptFileBuffer;
