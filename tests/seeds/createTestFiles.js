/**
 * Node modules.
 */
const mongoose = require("mongoose");

/**
 * Model import.
 */
const File = require("../../models/file.model");

/**
 * Utils import
 */
const getTinyUrl = require("../../utils/urlShortner");

/**
 * Globals.
 */
const origin = process.env.NODE_ENV === "production" ? "https://hackerspace-fileshare.herokuapp.com" : "http://localhost:3001";
let fileLink;

module.exports.createTestFile = async (testFileId) => {
    // New test file object
    const testFile = {
        _id: testFileId,
        fieldname: "file",
        originalname: "test.txt",
        buffer: Buffer.from("test"),
        size: 4
    };

    fileLink = await getTinyUrl(
        process.env.ACCESS_TOKEN,
        `${origin}/api/v2/file/${testFile._id}`
    );

    testFile.shortUrl = fileLink;

    await new File(testFile).save();
}

module.exports.createProtectedLink = async (testFileId2) => {
    // New test file object
    const testFile = {
        _id: testFileId2,
        fieldname: "file",
        originalname: "test2.txt",
        buffer: Buffer.from("test"),
        size: 4,
        password: "test",
        protected: true
    };

    fileLink = await getTinyUrl(
        process.env.ACCESS_TOKEN,
        `${origin}/api/v2/file/${testFile._id}`
    );

    testFile.shortUrl = fileLink;

    await new File(testFile).save();
}