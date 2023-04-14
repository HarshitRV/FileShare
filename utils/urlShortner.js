/**
 * Node modules.
 */
const fetch = require("node-fetch");

/**
 * @description - This function takes a long url and returns a short url using tinyurl.com api.
 * @param {String} apiToken - The api token for tinyurl.com
 * @param {String} url - The long url to be shortened
 * @returns {String} shortUrl - The short url or an empty string in case of error.
 */
const getTinyUrl = async (apiToken = process.env.ACCESS_TOKEN, url) => {
	try {
		const data = await fetch("https://api.tinyurl.com/create", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: url,
			}),
		});

		const json = await data.json();
		return json.data.tiny_url;
	} catch (e) {
		return "";
	}
};

module.exports = getTinyUrl;
