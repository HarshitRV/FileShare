const File = require("../models/file.model");

/**
 * @description -  This function is used to generate download link.
 * 
 */
const genDownloadLink = async (req, res, _ ) => {
    const { id } = req.params;

    const file = await File.findById(id);
    if(file == null) return res.status(404).send("File not found");

    if(file.password != null){
        if(req.body.password == null){
            return res.render("password")
        } else {
            const match = await file.checkPassword(req.body.password);
            if(!match) return res.render("password");
            
            file.downloadCount += 1;
            await file.save();

            return res.download(file.path, file.originalname);
        }
    } 
    file.downloadCount += 1;
    await file.save();

    return res.download(file.path, file.originalname);
}

module.exports = genDownloadLink;