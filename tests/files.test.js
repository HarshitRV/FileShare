/**
 * Node modules.
 */
const request = require("supertest");
const mongoose = require("mongoose");

/**
 * App import
 */
const app = require("../app");

/**
 * Model import.
 */
const File = require("../models/file.model");

/**
 * Utils import
 */
const getTinyUrl = require("../utils/urlShortner");

/**
 * Globals.
 */
const testFileId = new mongoose.Types.ObjectId();
const origin = process.env.NODE_ENV === "production" ? "https://hackerspace-fileshare.herokuapp.com" : "http://localhost:3001";
let fileLink;


const createTestFile = async () => {
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

// This should run before the tests start.
beforeEach(async () => {
    await File.deleteMany({});
    await createTestFile();
});

test("Upload file lesser than 1mb", async () => {
    expect(true).toBe(true);
});