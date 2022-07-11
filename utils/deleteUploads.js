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
            if(err) console.log(err);
            else console.log("Uploads folder deleted");
        });
        
    } else {
        console.log("Uploads folder does not exists");
    }
}

module.exports = deleteUploads;