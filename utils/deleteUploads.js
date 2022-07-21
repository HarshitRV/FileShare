/**
 * Node module.
 */
const fs = require("fs");

/**
 * @description - This function is used to delete the uploads folder
 * if it exists.
 */
const deleteUploads = () => {
    if(fs.existsSync('./uploads')){
        fs.rm('./uploads', { recursive: true }, (err)=>{
            if(err) console.error(err);
        }); 
    }
}

module.exports = deleteUploads;