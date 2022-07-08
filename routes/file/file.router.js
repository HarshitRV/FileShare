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
FileRouter
    .get('/file/:id', genDownloadFile, genDownloadLink)
    .post('/file/:id', genDownloadFile, genDownloadLink);
    
module.exports = FileRouter;