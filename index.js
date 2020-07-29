const Discord = require("discord.js");
const client = new Discord.Client();

const JsonDB = require("node-json-db").JsonDB;
const ConfigDB = require("node-json-db/dist/lib/JsonDBConfig").Config; 
var db = new JsonDB(new ConfigDB("db", true, true, "/"));

client.on("ready", () => {
	console.log("Bot for testing automod pressure");
});

client.on("message", () => {
	var lastMsg = 0;
	try { lastMsg = db.getData("/" + message.author.id + "/lastMsg"); }
	catch { db.push("/" + message.author.id + "/lastMsg", (new Date).getTime()); }
	
	if(lastMsg != 0 && (new Date).getTime() - lastMsg > 700) {
		message.reply("You are spamming too much");
	}
});