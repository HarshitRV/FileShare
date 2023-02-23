/**
 * Node module imports
 */
const { Router } = require("express");

/**
 * Crypt Router
 */
const CryptRouterV1 = Router();

/**
 * Controller Imports
 */
const {
	createKeyPairs,
} = require("../../../controllers/v1/crypt/crypt.controller.v1");

/**
 * Routes
 */
CryptRouterV1.get("/create", createKeyPairs);

module.exports = CryptRouterV1;