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

		console.log("reciever private key", receiverPrivateKey);

		const encryptedSecretKey = file.secretKey;

		let decryptedSecretKey
		try {
			decryptedSecretKey = decryptData(
				encryptedSecretKey,
				receiverPrivateKey
			);
		} catch (e) {
			return res.status(400).send({
				message: "unauthorized to access",
			});
		}
		

		console.log("decryptedSecretKey", decryptedSecretKey.toString("utf-8"));

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
