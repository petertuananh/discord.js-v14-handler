const { con } = require('./utils/mysql')
const  Discord  = require('discord.js');
const fs = require('fs');
const config = require('./JSON/config.json')
const { I18n } = require('i18n')
const path = require("path");
require('events').defaultMaxListeners = config.setting.defaultMaxListeners;
const yourauth = new Discord.Client({
    restTimeOffset: 0,
    allowedMentions: {
        parse: ["roles", "users", /*"everyone"*/ ],
        repliedUser: false,
    },
    intents: [
		Discord.GatewayIntentBits.Guilds, 
		Discord.GatewayIntentBits.GuildMessages, 
		Discord.GatewayIntentBits.GuildMembers, 
		// Discord.GatewayIntentBits.GuildPresences,
		Discord.GatewayIntentBits.GuildMessageReactions, 
		Discord.GatewayIntentBits.DirectMessages,
		Discord.GatewayIntentBits.MessageContent
	],
	partials: [
        Discord.Partials.Channel,
        Discord.Partials.Message,
        Discord.Partials.User,
        Discord.Partials.GuildMember,
        Discord.Partials.Reaction,
    ],
    disableEveryone: true,
    // ws: { properties: { $browser: config.setting.presence.phone ? "Discord iOS" : "" }},
});
module.exports = yourauth;
// yourauth.emoji = require('./config/emoji.json')

yourauth.config = config
yourauth.mysql = con
yourauth.Discord = Discord
yourauth.i18n = new I18n({
    locales: ['en', 'vi'],
    directory: path.join(__dirname, 'locales')
})
yourauth.functions = require("./utils/functions")
yourauth.commands = new Discord.Collection();
yourauth.aliases = new Discord.Collection();
yourauth.categories = fs.readdirSync("./commands/");
yourauth.cooldowns = new Discord.Collection();
yourauth.delay = ms => new Promise(res => setTimeout(res, ms));
yourauth.embedCollection = new Discord.Collection();
yourauth.interactions = new Discord.Collection();
yourauth.snipes = new Discord.Collection();
yourauth.slashcommands = new Discord.Collection();

const res = fs.readdirSync('./handlers');
res.map(name => require(`./handlers/${name}`)(yourauth));

if (config.setting.devMode) {
    yourauth.login(config.bot.beta.token)
} else {
    yourauth.login(config.bot.basic.token)
}