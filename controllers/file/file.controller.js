/**
 * Node modules.
 */
const fs = require("fs");

/**
 * Model import.
 */
const File = require("../../models/file.model");

/**
 * Utils imports.
 */
const catchAsync = require("../../utils/catchAsync");

/**
 * @description - This function is used to upload files.
 */
module.exports.uploadFile = catchAsync(async (req, res, next) => {
    
    const { password, uploadPin } = req.body;

    if(!uploadPin) return res.status(400).send({
        message: "Upload pin is required"
    })

    if(uploadPin !== process.env.UPLOAD_PIN) return res.status(400).send({
        message: "Upload pin is invalid"
    })

    const fileData = req.file;

    // Check if file is already exists.
    const existingFile = await File.findOne({
        originalname: fileData.originalname
    });

    if(existingFile){
        const fileLink = `${req.headers.origin}/file/${existingFile._id}`;

        return res.render('home', {
            message: `File with name ${fileData.originalname} already exists at`,
            fileLink
        });
    };
   
    if(password != null && password != ""){
        fileData.password = password;
    }

    const file = new File(fileData);
    await file.save();

    const fileLink = `${req.headers.origin}/file/${file._id}`;

    return res.render("home", {
        message: "Your file is uploaded to",
        fileLink
    });
});

/**
 * @description -  This function is used to generate download link.
 * 
 */
module.exports.genDownloadLink = async (req, res, _ ) => {
    const {
        file,
        downloadPath,
        originalname
    } = req;

    if(file.password != null){
        if(req.body.password == null){
            return res.render("password")
        } else {
            const match = await file.checkPassword(req.body.password);
            if(!match) return res.render("password");
            
            file.downloadCount += 1;
            await file.save();

            return res.download(downloadPath, originalname);
        }
    } 

    file.downloadCount += 1;
    await file.save();
    
    return res.download(downloadPath, originalname);
}

/**
 * @description - This function is used to delte the uploads folder
 * if it exists.
 */
module.exports.deleteUploads = async (req, res) => {
    if(fs.existsSync('./uploads')){
        fs.rm('./uploads', { recursive: true }, (err)=>{
            if(err) return res.status(500).send({
                message: "Error while deleting uploads folder",
                err
            })

            return res.status(200).send({
                message: "Uploads folder is deleted"
            })
        });
        
    } else {
        return res.status(200).send({
            message: "Uploads folder does not exists"
        })
    }
}