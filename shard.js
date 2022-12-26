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