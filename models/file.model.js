/**
 * Node modules.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

/**
 * File schema.
 */
const fileSchema = new Schema({
    path: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    downloadCount: {
        type: Number,
        required: true,
        default: 0
    }
});

/**
 * Before saving hash and salt the password if it has been modified.
 */
fileSchema.pre("save", async function (next) {
    try {
        if(this.isModified("password")){
            const hash = await bcrypt.hash(this.password, 8);
            this.password = hash;
        }
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * Compare the hashed password with the password provided.
 */
fileSchema.methods.checkPassword = function (password) {
    const passwordHash = this.password;
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, passwordHash, (err, same) => {
        if (err) {
            return reject(err);
        }
        resolve(same);
        });
    });
};

const File = mongoose.model("File", fileSchema);

module.exports = File;