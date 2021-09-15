import ytsr from "ytsr";
import ytpl from "ytpl";

export default async function (q) {
	// Checking if the query is a youtube playlist
	if (String(q).startsWith("https://www.youtube.com/playlist?list=")) {
		// Getting all the videos in the playlist
		const data = (await ytpl(q)).items;
		let videos = [];
		// Mapping the data to the videos array with a simple object with title and url
		data.map((video) => {
			videos.push({ title: video.title, url: video.shortUrl });
		});
		return videos;
	}
	// Otherwise, it's a normal query, then we search for it and return the first result
	const data = await ytsr(q, { limit: 1 });
	return { title: data.items[0].title, url: data.items[0].url };
}
