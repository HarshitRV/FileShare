/**
 * Node modules
 */
const app = require("./app");
const socketio = require("socket.io");
const { createServer } = require("http");
const server = createServer(app);
const io = socketio(server);
const { updateCount } = require("./utils/updateCount");

/**
 * Model import.
 */
const LoadStats = require("./models/loadstats.model");

const PORT = process.env.PORT || 3002;

let activeUsers = 0;

io.on("connection", async (socket) => {
	console.log("New WebSocket connection");

	activeUsers++;
	updateCount(socket.handshake.headers.host, activeUsers);

	socket.on("con", (connect, callback) => {
		console.log(connect);

		io.emit("newUser", activeUsers);
	});

	socket.on("disconnect", async () => {
		console.log("user disconnected");
		activeUsers--;

		updateCount(socket.handshake.headers.host, activeUsers);

		io.emit("userLeft", activeUsers);
	});
});

server.listen(PORT, async () => {
	// reset the stats of the port that is being used upon server restart
	// find the hostname and update the activeUsers to 0
	const existingHost = await LoadStats.findOne({
		hostname: `localhost:${PORT}`,
	});
	if(existingHost) {
		existingHost.activeUsers = 0;
		await existingHost.save();
	} else {
		const newHost = new LoadStats({
			hostname: `localhost:${PORT}`,
			activeUsers: 0,
			maxLoad: process.env.maxLoad,
		});
		await newHost.save();
	}

	console.log(`${process.env.NODE_ENV} server is running on port ${PORT}`);
});
