const fs =  require("fs");
const crypto = require("crypto");

module.exports.encryptText = (plainText) => {
	return crypto.publicEncrypt(
		{
			key: fs.readFileSync("./openssl/public_key.pem", "utf-8"),
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		Buffer.from(plainText)
	);
};

module.exports.decryptText = (encryptedText) => {
	return crypto.privateDecrypt(
		{
			key: fs.readFileSync("./openssl/private_key.pem", "utf-8"),
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		encryptedText
	);
};
