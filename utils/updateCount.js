const LoadStats = require("../models/loadstats.model.js");

module.exports.updateCount = async (hostname, activeUsers) => {
	const existingHost = await LoadStats.findOne({
		hostname,
	});

	if (existingHost) {
		existingHost.activeUsers = activeUsers;
		await existingHost.save();
	} else {
		const newHost = new LoadStats({
			hostname,
			activeUsers,
			maxLoad: process.env.maxLoad,
		});
		await newHost.save();
	}
};
