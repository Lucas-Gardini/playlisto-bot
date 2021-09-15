import ytdl from "ytdl-core";
import search from "../utils/search.js";
import download from "../utils/download.js";
import fs from "fs";

import { MessageEmbed } from "discord.js";

export default class Player {
	constructor() {
		// Defining default variables
		this.playlist = [];
		this.currentMusic = "";
		this.connection = null;
		this.playing = false;
	}

	async play(ctx, args) {
		// Checking if the user searched for something
		if (args.length === 0) return;
		// Checking if the user is in a voice channel
		if (!this.connection) {
			const voiceChannel = ctx.member.voice.channel;
			this.connection = await voiceChannel.join();
		}
		// Checking args (skip, stop, prev or music)
		if (args === "skip") {
			this.playlist.slice(this.playlist.indexOf(this.currentMusic), 1);
			this.playing = false;
		} else if (args === "stop") {
			this.playlist = [];
			this.playing = false;
			this.connection.disconnect();
		} else if (typeof args === "number") {
			this.currentMusic = this.playlist[args];
		} else {
			let music;
			// Checking if user is searching a song or if it is a url
			if (args.includes("https://www.youtube.com/watch?v=")) {
				this.currentMusic = args;
			} else {
				music = await search(args.join(" "));
				// Checking if it's only one music or an array
				if (music.constructor === Array) {
					this.playlist = music;
					this.currentMusic = music[0];
				} else {
					this.currentMusic = music;
				}
			}
			ctx.channel.send(`Adicionado a playlist: ${this.currentMusic.title}`);
			this.playlist.push(music);
		}

		// Checking if the playlist has music and nothing is playing
		if (this.playlist.length > 0 && this.playing === false) {
			this.playing = true;
			// Download the music and then play it
			this.musicPlayer = this.connection.play(
				await download(this.currentMusic.url, this.currentMusic.title)
			);
			// Force the bot to connect to user voice channel
			ctx.member.voice.channel.join();
			ctx.channel.send(`Tocando agora: ${this.currentMusic.title}`);
			// Handling music events
			this.musicPlayer.on("finish", () => {
				console.log(`Terminou de tocar: ${this.currentMusic.title}`);
				// Removing the current music and playing the next one
				let musicIndex = this.playlist.indexOf(this.currentMusic);
				this.playlist.slice(musicIndex, 1);
				this.playing = false;
				this.play(ctx, musicIndex + 1);
			});
			this.musicPlayer.on("error", (err) => {
				console.log(err);
			});
		}
	}

	async previous(ctx) {
		this.play(ctx, "prev");
	}

	async skip(ctx) {
		this.play(ctx, "skip");
	}

	async stop(ctx) {
		this.play(ctx, "stop");
	}

	async clear() {
		this.playlist = [];
		this.currentMusic = "";
		this.playing = false;
		this.connection.disconnect();
	}

	async pause() {
		if (this.playing) return this.connection.play();
		this.musicPlayer.pause();
	}

	async queue(ctx) {
		// Checking if the playlist has more than 20 songs
		if (this.playlist.length > 20) {
			let musics = [];
			this.playlist.forEach((music, index) => {
				musics.push(`${index}: ${music.title}`);
			});
			// Creating a file queue.txt, adding the queue to it, and then sending to discord chat
			try {
				fs.writeFileSync("./queue.txt", musics.join("\n"), { flag: "wx" });
			} catch (error) {
				fs.writeFileSync("./queue.txt", musics.join("\n"));
			}
			return ctx.channel.send("Fila", { files: ["queue.txt"] });
		}
		// If the playlist has less than 20 songs, just send a embed with it
		let embed = new MessageEmbed();
		for (let music of this.playlist) {
			embed.addField(music.title, music.url);
		}
		ctx.channel.send(embed);
	}
}
