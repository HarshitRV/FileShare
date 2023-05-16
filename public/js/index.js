"use strict";
console.log("index.js loaded...");

const activeUserCount = document.getElementById("active-user-count");
const userCount = 0;

import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const socket = io();

console.log("socket.io loaded...", socket);

const url = window.location.href;

if (url.includes("/upload")) {
	const copyToClipboard = document.getElementById("clipboard");
	const shareLink = document.getElementById("share-link");
	const shareBtn = document.getElementById("share-btn");

	console.log(shareLink.textContent);
	const shareData = {
		title: "Share",
		text: "Share the generated link",
		url: shareLink.textContent,
	};

	shareBtn.addEventListener("click", async (e) => {
		e.preventDefault();
		if (navigator.canShare) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				console.log(err);
			}
		} else {
			alert("Your browser does not support the Share API");
		}
	});

	copyToClipboard.addEventListener("click", async () => {
		if (window.location.protocol != "https:")
			return alert("HTTPS is required to copy to clipboard");
		await navigator.clipboard.writeText(shareLink.textContent);
		console.log(navigator.clipboard);
		alert("Copied to clipboard");
	});
}

socket.emit("con", { connect: true }, (error) => {
	if (error) {
		alert(error);
	} else {
		alert("new connection");
	}
});

socket.on("newUser", (count) => {
	console.log(count);
	activeUserCount.textContent = count;
});

socket.on("userLeft", (count) => {
	console.log(count);
	activeUserCount.textContent = count;
});