const Discord = require("discord.js");
const client = new Discord.Client();

const JsonDB = require("node-json-db").JsonDB;
const ConfigDB = require("node-json-db/dist/lib/JsonDBConfig").Config; 
var db = new JsonDB(new ConfigDB("db", true, true, "/"));

// Components in config.js:
// 1) token
const config = require("./config.js");

client.on("ready", () => {
	console.log("Bot for testing automod pressure");
});

client.on("message", message => {
	if(message.author.bot) return;
	
	// Check if the user's entry exits in database
	// If not then create it.
	var lastMsg = 0;
	try { lastMsg = db.getData("/" + message.author.id + "/lastMsg"); }
	catch { setupUser(message); }
	
	const timeNow = (new Date).getTime();
	
	if(lastMsg != 0 && timeNow - lastMsg > 700) {
		// When was the user last warned?
		const lastWrn = db.getData("/" + message.author.id + "/lastWrn");
		
		// Warn only if last warn was longer than 7 seconds ago
		// else we are just spam warning.
		if(timeNow - lastWrn > 7000) {
			message.reply("You are spamming too much");
			
			// Update last warn timing
			db.push("/" + message.author.id + "/lastWrn", timeNow); 
		}
	}
	
	// Update last message timing
	db.push("/" + message.author.id + "/lastMsg", timeNow); 
});

client.login(config.token);

// Setup the user
function setupUser(message) {
	db.push("/" + message.author.id + "/lastWrn", -1); 
	db.push("/" + message.author.id + "/lastMsg", -1); 
	
}