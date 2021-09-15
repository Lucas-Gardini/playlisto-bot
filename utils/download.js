import ytdl from "ytdl-core";
import slugify from "slugify";
import fs from "fs";

export default async function (url, title) {
	// Extending slugify settings
	slugify.extend({
		"|": "",
	});
	title = slugify(title, {
		replacement: " ", // Replacing all invalid chars with a space
	});
	// Returning a promise that downloads the video to an mp3 file
	return new Promise((resolve, reject) => {
		ytdl(url, { filter: "audioonly" })
			.pipe(fs.createWriteStream("./resources/" + title + ".mp3"))
			.on("finish", () => {
				resolve("./resources/" + title + ".mp3");
			});
	});
}
