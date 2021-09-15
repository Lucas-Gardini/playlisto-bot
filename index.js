import fs from "fs";
if (fs.existsSync("./resources") === false) {
	fs.mkdirSync("./resources");
}

import { Client, Message, Intents } from "discord.js";
import { config } from "dotenv";
import ora from "ora";

import Player from "./utils/player.js";
const player = new Player();

// Configure dotenv
config();
const prefix = process.env.PREFIX;

// Configure loader
const botLoader = ora("Iniciando bot");
botLoader.color = "green";
botLoader.start();

// Create client
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Detect when ready
client.on("ready", () => {
	botLoader.succeed("Bot iniciado com sucesso");
});

// Detect message
client.on("message", async (ctx) => {
	// Check if message isn't from the bot itself
	if (ctx.author.username === client.user.username) return;
	// Check if message isn't from a guild
	if (!ctx.guild) {
		return ctx.channel.send("Eu só funciono em servidor otário");
	}

	// Check if message starts with prefix
	if (ctx.content.startsWith(prefix)) {
		// Slice command and args
		const command = ctx.content.slice(prefix.length).split(" ")[0];
		if (command === "play" || command === "p") {
			const args = ctx.content.slice(prefix.length).split(" ").slice(1);
			return player.play(ctx, args);
		}
		if (command === "skip" || command === "s") {
			return player.skip(ctx);
		}
		if (command === "stop" || command === "st") {
			return player.stop(ctx);
		}
		if (command === "pause" || command === "ps") {
			return player.pause();
		}
		if (command === "clear" || command === "c") {
			return player.clear();
		}
		if (command === "queue" || command === "q") {
			return player.queue(ctx);
		}
	}
});

// Login
client.login(process.env.TOKEN);
