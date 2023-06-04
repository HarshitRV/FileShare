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
	deleteUser,
	registeredUser,
	getKeys,
	createHash,
	verifyFile,
} = require("../../../controllers/v1/crypt/crypt.controller.v1");
const { upload } = require("../../../utils/mutler");

/**
 * Routes
 */
// Create keys for user
CryptRouterV1.get("/create", createKeyPairs);

// Mark user as registered
CryptRouterV1.get("/registered", registeredUser);

// Get user keys
CryptRouterV1.get("/getKeys", getKeys);

// Create hash for keys
CryptRouterV1.post('/createHash', createHash);

// Upload file
CryptRouterV1.post("/upload", upload.single("file"), encryptFile);

// Verify file
CryptRouterV1.get("/verifyFile/:id", verifyFile);

// Download file
CryptRouterV1.get("/file/:id", decryptFileBuffer, genDownloadFile, downloadFile);

// Delete user
CryptRouterV1.delete("/deleteUser", deleteUser);

module.exports = CryptRouterV1;
