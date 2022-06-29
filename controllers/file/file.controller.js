/**
 * Node modules.
 */
const bcrypt = require("bcrypt");

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
    const { path, originalname } = req.file;
    const { password } = req.body;

    const fileData = {
        path,
        originalname
    };

    if(password != null && password != ""){
        fileData.password = password;
    }

    const file = new File(fileData);
    await file.save();


    const fileLink = `${req.headers.origin}/file/${file._id}`;
    console.log(fileLink);
    return res.render("home", {
        fileLink
    });
});