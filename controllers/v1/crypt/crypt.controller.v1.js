/**
 * Node modules
 */

/**
 * Utils imports
 */
const catchAsync = require("../../../utils/catchAsync");
const { genKeyPairs } = require("../../../utils/crypt/openssl");

/**
 * @description - Generates public private key pairs
 */
module.exports.createKeyPairs = catchAsync(async (req, res, next) => {
	const isKeysCreated = await genKeyPairs();
	if (isKeysCreated) {

        // Now associate it with the user
        // 

		return res.status(201).send({
			message: "keys created",
		});
	}
	return res.status(500).send({
		message: "something went wrong",
	});
});

module.exports.encryptFile = catchAsync(async (req, res, next) => {});

module.exports.decryptFile = catchAsync(async (req, res, next) => {});
