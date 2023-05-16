/**
 * Node modules.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Stats schema.
 */
const statsSchema = new Schema(
	{
		hostname: {
			type: String,
		},
		activeUsers: {
			type: Number,
			required: true,
			default: 0,
		},
		maxLoad: {
			type: Number,
			required: true,
		}
	},
	{
		timestamps: true,
	}
);

const LoadStats = mongoose.model("LoadStat", statsSchema);

module.exports = LoadStats;
