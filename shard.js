const config = require("./config.json")
const Discord = require('discord.js');
const ascii = require('ascii-table');
const express = require("express");
const app = express()
const systemInfo = require("systeminformation");
const moment = require("moment");
require("moment-duration-format");
let table = new ascii("Shard status");
table.setHeading("Id", "Status");
const exec = require('node:child_process').exec;
const manager = new Discord.ShardingManager('./yourauth.js', {
    token: config.bot.basic.token,
    totalShards: config.setting.shard,
    mode: "process"
});

manager.spawn(manager.totalShards, 10000);
manager.on('shardCreate', async (shard) => {
    table.addRow(shard.id, `Launched shard #${shard.id}`)
    console.log(table.toString());
});


const functions = {
    toFancyNumber: function (num) {
        return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatBytes: function (a, b) {
        if (a == 0) return "0B";
        const c = 1024;
        const d = b || 2;
        const e = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        return (
            parseFloat(
                (a / Math.pow(c, Math.floor(Math.log(a) / Math.log(c)))).toFixed(d),
            ) +
            " " +
            e[Math.floor(Math.log(a) / Math.log(c))]
        );
    }
}


app.get('/api/bot', async function (req, res) {
    try {
        const promise = await manager.broadcastEval(c => {
            return [
                c.shard.ids[0],
                c.guilds.cache.size,
                c.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0),
                c.channels.cache.size,
                c.uptime,
                c.ws.ping - 19,
                process.memoryUsage().heapUsed,
                process.memoryUsage().heapTotal
            ];
        });
        const promises = [
            manager.fetchClientValues('guilds.cache.size'),
            manager.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        ];
        const results = await Promise.all(promises);
        const totalGuilds = results[0].reduce((acc_1, guildCount) => acc_1 + guildCount, 0);
        const totalMembers = results[1].reduce((acc_2, memberCount) => acc_2 + memberCount, 0);
        const final = {
            "guilds": functions.toFancyNumber(totalGuilds),
            "users": functions.toFancyNumber(totalMembers),
            "freeRam": functions.formatBytes((await systemInfo.mem()).used),
            "totalRam": functions.formatBytes((await systemInfo.mem()).total),
            "shards": promise,
        };
        let i = 0;
        for (const value of promise) {
            if (functions.toFancyNumber(value[1]) > 0) {
                final.shards[(i)] = {
                    "id": parseInt(value[0]),
                    "servers": functions.toFancyNumber(value[1]),
                    "users": functions.toFancyNumber(value[2]),
                    "channels": functions.toFancyNumber(value[3]),
                    "uptime": `${moment.duration(value[4]).format("d:hh:mm:ss")}s`,
                    "ping": `${value[5]} ms`,
                    "hram": functions.formatBytes(value[6]),
                    "thram": functions.formatBytes(value[7]),
                };
                i++;
            };
            if (functions.toFancyNumber(value[1]) == 0) {
                final.shards[(i)] = {
                    "id": parseInt(value[0]),
                    "starting": true,
                };
            };
        }
        res.json(final);
    } catch (e) {
        const final = {
            "code": 500,
            "msg": `Error: ${e}`,
        };
        res.json(final);
    }
});
app.get('/api/:target', async (req, res) => {
    if (req.params.target == 'shutdown') {
        exec(`pm2 stop shard.js`, function(error, stdout, stderr){
            if (stderr) return res.json({code : 400})
            return res.json({code : 200})
        });
    } else if (req.params.target == 'restart') {
        exec(`pm2 restart shard.js`, function(error, stdout, stderr){
            if (stderr) return res.json({code : 400})
            return res.json({code : 200})
        });
    }
})
app.listen(config.setting.internalAPI.port, () => {
    console.log(`API is working at port ${config.setting.internalAPI.port}`)
})