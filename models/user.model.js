/**
 * Node modules
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Keys Schema
 */
const keysSchema = new Schema(
	{
		publicKey: {
			type: String,
			trim: true,
		},
		privateKey: {
			type: String,
			trim: true,
		},
		aesKey: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

/**
 * Wallet Schema
 */
const userSchema = new Schema(
	{
		publicAddress: {
			type: String,
			required: true,
			trim: true,
		},
		keys: keysSchema,
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);

module.exports = User;
