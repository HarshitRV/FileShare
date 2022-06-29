/**
 * Node module imports.
 */
const { Router } = require('express');

/**
 * Controller imports.
 */
const { uploadFile } = require('../../controllers/file/file.controller');

/**
 * Middlewares.
 */
const { upload } = require("../../utils/mutler");
const genDownloadLink = require("../../middlewares/genDownloadLink");

/**
 * File router.
 */
const FileRouter = Router();

/**
 * Routes
 */
FileRouter.post('/upload', upload.single("file"), uploadFile);
FileRouter.get('/file/:id', genDownloadLink);
FileRouter.post('/file/:id', genDownloadLink);

module.exports = FileRouter;