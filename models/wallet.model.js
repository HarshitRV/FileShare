/**
 * Node modules
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Keys Schema
 */
const keysSchema = new Schema({
    
});

/**
 * Wallet Schema
 */
const walletSchema = new Schema({
	publicAddress: {
		type: String,
	},
	keys: {},
});
