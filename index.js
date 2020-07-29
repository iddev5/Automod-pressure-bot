const Discord = require("discord.js");
const client = new Discord.Client();

const JsonDB = require("node-json-db").JsonDB;
const ConfigDB = require("node-json-db/dist/lib/JsonDBConfig").Config; 
var db = new JsonDB(new ConfigDB("db", true, true, "/"));

// Components in config.js:
// 1) token
// 2) cooldown
const config = require("./config.js");

const cooldown = config.cooldown || 7000;
const pointWrn = config.pointWrn || 7;

client.on("ready", () => {
	console.log("Bot for testing automod pressure");
});

client.on("message", message => {
	if(message.author.bot) return;
	
	// Check if the user's entry exits in database
	// If not then create it.
	var lastWrn = 0;
	try { lastWrn = db.getData("/" + message.author.id + "/lastWrn"); }
	catch { setupUser(message); }
	
	const timeNow = (new Date).getTime();
	
	var lastPoints = db.getData("/" + message.author.id + "/points");
	var lastMsg = db.getData("/" + message.author.id + "/lastMsg");
	
	const timeDiff = timeNow - lastMsg;
	
	if(timeDiff <= 700) {
		lastPoints += 2;
	}
	else {
		lastPoints -= (0.5 * timeDiff / 1000);
	}
	
	if(timeNow - lastWrn > cooldown) {
		if(lastPoints == config.pointWrn) {
			// Warn only if last warn was longer than 7 seconds ago
			// else we are just spam warning.
			message.reply("You are spamming too much");
		}
		else if(lastPoints >= config.pointWrn + 4) {
			// Mute as the last resort.
			message.reply("You are getting MUTED");
		}
		
		// Update last warn timing
		db.push("/" + message.author.id + "/lastWrn", timeNow); 
		lastPoints -= 2; 
	}
	
	// Update the points
	db.push("/" + message.author.id + "/points", Math.max(0, lastPoints++)); console.log(lastPoints);
	db.push("/" + message.author.id + "/lastMsg", timeNow); 
});

client.login(config.token);

// Setup the user
function setupUser(message) {
	db.push("/" + message.author.id + "/points", 0);
	db.push("/" + message.author.id + "/lastWrn", -1); 
	db.push("/" + message.author.id + "/lastMsg", -1); 
}