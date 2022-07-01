/**
 * Node module imports.
 */
const { Router } = require('express');

/**
 * Controller imports.
 */
const { 
    uploadFile, 
    genDownloadLink,
    deleteUploads 
} = require('../../controllers/file/file.controller');

/**
 * Middlewares.
 */
const { upload } = require("../../utils/mutler");
const genDownloadFile = require("../../middlewares/genDownloadFile")

/**
 * File router.
 */
const FileRouter = Router();

/**
 * Routes
 */
FileRouter.post('/upload', upload.single("file"), uploadFile);
FileRouter.get('/file/:id', genDownloadFile, genDownloadLink);
FileRouter.post('/file/:id', genDownloadFile, genDownloadLink);
FileRouter.get('/delete', deleteUploads);

module.exports = FileRouter;