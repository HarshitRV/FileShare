const fs = require("fs");
const openssl = require("openssl-nodejs");

/**
 * @description - This function generates the public and private key pairs using the 
                  openssl.

 * @returns promise - resolves true -> when private and public key pairs are generate
 * @returns promise - resolved false -> when there is error generating key pairs
 */
module.exports.genKeyPairs = async () =>
	new Promise(async (resolves, rejects) => {
		if (!fs.existsSync("openssl")) fs.mkdirSync("openssl");
		openssl("openssl genrsa -out private_key.pem 4096", function (err, buffer) {
			if (fs.existsSync("./openssl/private_key.pem")) {
				openssl(
					"openssl rsa -pubout -in private_key.pem -out public_key.pem",
					function (err, buffer) {
						if (fs.existsSync("./openssl/public_key.pem")) resolves(true);
						else rejects(false);
					}
				);
			} else {
				rejects(false);
			}
		});
	});
