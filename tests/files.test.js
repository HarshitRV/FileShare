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
 * Seeds import.
 */
const {
    createTestFile,
    createProtectedLink
} = require("./seeds/createTestFiles")

/**
 * Globals
 */
const testFileId = new mongoose.Types.ObjectId();
const testFileId2 = new mongoose.Types.ObjectId();

// This should run before the tests start.
beforeEach(async () => {
    await File.deleteMany({});
    await createTestFile(testFileId);
    await createProtectedLink(testFileId2);
});

test("Should upload a file smaller than 1mb", async () => {
    await request(app)
        .post("/api/v2/upload")
        .attach("file", "tests/fixtures/Test.pdf")
        .expect(201)
    
    const file = await File.findOne({originalname: "Test.pdf"}); 
    expect(file.buffer).toEqual(expect.any(Buffer));
}, 10000);

test("Should not upload a file larger than 1mb without upload pin", async () => {
    await request(app)
    .post("/api/v2/upload")
    .attach("file", "tests/fixtures/LargerThan1mb.pdf")
    .expect(400)
}, 10000);

test("Should upload a file larger than 1mb with the upload pin", async () => {
    await request(app)
    .post("/api/v2/upload")
    .attach("file", "tests/fixtures/LargerThan1mb.pdf")
    .field({uploadPin: process.env.UPLOAD_PIN})
    .expect(201)

    const file = await File.findOne({originalname: "LargerThan1mb.pdf"}); 
    expect(file.buffer).toEqual(expect.any(Buffer));
}, 10000);

test("Should upload a file and protect it with password", async()=>{
    await request(app)
    .post("/api/v2/upload")
    .attach("file", "tests/fixtures/Test2.pdf")
    .field({password: "test"})
    .expect(201)

    const file = await File.findOne({originalname: "Test2.pdf"}); 
    expect(file.buffer).toEqual(expect.any(Buffer));
    
}, 10000);

test("Should download a non-protected file", async () => {
    await request(app)
        .get(`/api/v2/file/${testFileId}`)
        .expect(200)
      
}, 10000);

test("Should not download a protected file without password", async () => {
    await request(app)
        .post(`/api/v2/file/${testFileId2}`)
        .expect(400)
}, 10000);

test("Should download a protected file with correct password", async () => {
    await request(app)
        .post(`/api/v2/file/${testFileId2}?password=test`)
        .expect(200)
}, 10000);

test("Should clear the uploads folder if it exists", async()=>{
    await request(app)
    .get("/api/v2/delete")
    .expect(200)
});


afterAll(async () => {
    await mongoose.connection.close();
})