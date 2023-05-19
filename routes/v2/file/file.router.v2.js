/**
 * Node module imports.
 */
 const { Router } = require('express');

 /**
  * Controller imports.
  */
 const { 
     uploadFileV2, 
     genDownloadLinkV2,
 } = require('../../../controllers/v2/file/file.controller.v2');
 
 /**
  * Middlewares.
  */
 const { upload } = require("../../../utils/mutler");
 const genDownloadFile = require("../../../middlewares/genDownloadFile");
 const { clearUploads } = require("../../../controllers/file/file.controller");
 
 /**
  * File router.
  */
 const FileRouterV2 = Router();
 
 /**
  * Routes
  */
 FileRouterV2.post('/upload', upload.single("file"), uploadFileV2);
 
 FileRouterV2
     .get('/file/:id', genDownloadFile, genDownloadLinkV2)
     .post('/file/:id', genDownloadFile, genDownloadLinkV2); // for downloading password protected files
     
 FileRouterV2.get('/delete', clearUploads);
     
 module.exports = FileRouterV2;