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
    
    const { password } = req.body;

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

    console.log("path", downloadPath);
    console.log("originalname", originalname);

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
