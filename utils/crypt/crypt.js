const fs = require("fs");
const crypto = require("crypto");

/**
 * @description Uses RSA public key cryptography to encrypt the data
 * @param {*} plainText
 * @param {*} _key
 * @returns
 */
module.exports.encryptData = (plainText, _key = null) => {
	return crypto.publicEncrypt(
		{
			key: _key ? _key : fs.readFileSync("./openssl/public_key.pem", "utf-8"),
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		Buffer.from(plainText)
	);
};

/**
 * @description Uses RSA public key cryptography. Receivers private key is required to decrypt the data
 * @param {*} encryptedText
 * @param {*} _key
 * @returns
 */
module.exports.decryptData = (encryptedText, _key = null) => {
	return crypto.privateDecrypt(
		{
			key: _key ? _key : fs.readFileSync("./openssl/private_key.pem", "utf-8"),
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			oaepHash: "sha256",
		},
		encryptedText
	);
};

/**
 * @description User AES symmetric encryption to encrypt the buffer data
 * @param {*} data Buffer
 * @param {*} key AES Key
 * @returns
 */
module.exports.encryptBuffer = (data, key) => {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
	const encrypted = Buffer.concat([iv, cipher.update(data), cipher.final()]);
	return encrypted;
};

/**
 * @description Uses AES symmetric decryption to decrypt the buffer data
 * @param {*} encryptedData Buffer
 * @param {*} key AES Key
 * @returns
 */
module.exports.decryptBuffer = (encryptedData, key) => {
	const iv = encryptedData.slice(0, 16);
	const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
	const decrypted = Buffer.concat([
		decipher.update(encryptedData.slice(16)),
		decipher.final(),
	]);
	return decrypted;
};
