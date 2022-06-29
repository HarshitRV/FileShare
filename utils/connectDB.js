const mongoose = require("mongoose");

/**
 * @description: Connect to the database by providing the connection string.
 * @param {String} uri | MongoDB URI
 * @default: mongodb://localhost:27017/filesDB
 *
 * @returns {undefined}
 */
const connectDB = (url = process.env.MONGODB_LOCAL_URI) => {
    try {
      const con = mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      if(con) console.log("MongoDB connected...")
    } catch(e){
      console.log(`Error: ${e}`);
    }
};  

module.exports = connectDB;