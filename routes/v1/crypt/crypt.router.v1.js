/**
 * Node module imports
 */
const { Router } = require("express");

/**
 * Crypt Router
 */
const CryptRouterV1 = Router();

/**
 * Middlewares.
 */
const decryptFileBuffer = require("../../../middlewares/v1/crypt/decryptFileBuffer");
const genDownloadFile = require("../../../middlewares/genDownloadFile");

/**
 * Controller Imports
 */
const {
	createKeyPairs,
	encryptFile,
	downloadFile,
	deleteUser
} = require("../../../controllers/v1/crypt/crypt.controller.v1");
const { upload } = require("../../../utils/mutler");

/**
 * Routes
 */
CryptRouterV1.get("/create", createKeyPairs);

CryptRouterV1.post("/upload", upload.single("file"), encryptFile);

CryptRouterV1.post("/file/:id", decryptFileBuffer, genDownloadFile, downloadFile);

CryptRouterV1.delete("/deleteUser", deleteUser);

module.exports = CryptRouterV1;
