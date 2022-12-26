const yourauth = require('../../yourauth');
const Discord = require('discord.js');
yourauth.on('ready', async () => {
    console.log(`Logged in at ${yourauth.user.tag}`)
    yourauth.user.setStatus(yourauth.config.setting.presence.status)
    yourauth.user.setActivity(`From Vietnam | Shard ${yourauth.shard?.ids[0]}`)
})