const yourauth = require("../yourauth");
const NodeCache = require("node-cache");
const cache = new NodeCache();
const ms = require("ms");
const auditKeys = require("../JSON/auditKey.json");
const Discord = require("discord.js");
const features = require("../features");
const t = module.exports = {
    eventTrigged: {
        antiNuke: async function (data) {
            yourauth.mysql.query(`SELECT * FROM server_statics_config WHERE guild_id = ${data.target.guild.id}`, async function (err, statics) {
                data.now = Date.now();
                if (!data) return;
                if (!data.target) return;
                const nowRate = cache.get(`antinuke_rate_${data.key}_${data.target.guild.id}`);
                if (!nowRate) {
                    cache.set(`antinuke_rate_${data.key}_${data.target.guild.id}`, 1);
                } else {
                    cache.set(`antinuke_rate_${data.key}_${data.target.guild.id}`, parseInt(nowRate) + 1);
                    action()
                }
                if (data.noCache) return action()
                async function action() {
                    yourauth.mysql.query(`SELECT * FROM server_antinuke_config WHERE guild_id = ${data.target.guild.id}`, async function (err, res) {
                        if (!res[0]) return
                        const settings = {
                            name: data.key,
                            isEnabled: res[0][data.key],
                            score: res[0][`${data.key}.score`],
                            limit: res[0][`${data.key}.limit`],
                            action: res[0][`${data.key}.action`],
                            limitTime: res[0]?.time_limit
                        }
                        if (settings.isEnabled !== 1) return;
                        if ((nowRate !== settings.limit) || ((nowRate + 10) < settings.limit)) return;
                        cache.del(`antinuke_rate_${data.key}_${data.target.guild.id}`)
                        const me = await data.target.guild.members.fetchMe().catch(() => { return })
                        if (!me.permissions.has("Administrator")) return;
                        const executorAudit = data.target.member || await t.fetchAuditLog({
                            target: data.target,
                            auditKey: auditKeys[data.key]
                        })
                        if (executorAudit == yourauth.user.id) return;
                        const executor = await data.target.guild.members.fetch(executorAudit).catch(() => { return })
                        yourauth.mysql.query(`SELECT * FROM user_permit WHERE guild_id = ${data.target.guild.id} && user_id=${executor.id}`, async function (err, permit) {
                            yourauth.mysql.query(`SELECT * FROM user_class WHERE id=${executor.id}`, async (err, user_class) => {
                                if ((parseInt(permit[0]?.permit) >= 7) || user_class[0]?.isOwner || user_class[0]?.isDeveloper || user_class[0]?.isAdmin) return;
                                if (!executor.kickable || !executor.bannable) return
                                t.punish.antinuke({
                                    user: executor,
                                    target: data.target,
                                    punishment: settings.action,
                                    key: data.key,
                                    reason: `[Trigged ${features.antinuke[data.key].name}] | Punished after ${ms(Date.now() - data.now)}`
                                }).then(() => {
                                    if (data.actionToTarget) {
                                        yourauth.mysql.query(`SELECT * FROM user_permit WHERE guild_id = ${data.target.guild.id} && user_id=${data.target.id}`, async function (err, permit2) {

                                            yourauth.mysql.query(`SELECT * FROM user_class WHERE id=${data.target.id}`, async (err, user_class_2) => {
                                                if ((parseInt(permit2[0]?.permit) >= 7) || user_class_2[0]?.isOwner || user_class_2[0]?.isDeveloper || user_class_2[0]?.isAdmin) return;
                                                if (!data.target.kickable || !data.target.bannable) return
                                                t.punish.antinuke({
                                                    user: data.target,
                                                    target: data.target,
                                                    punishment: settings.action,
                                                    key: data.key,
                                                    reason: `[Trigged ${features.antinuke[data.key].name}] | Punished after ${ms(Date.now() - data.now)}`
                                                })
                                            })
                                        })
                                    }
                                    if (data.key == 'perm_dangerous') {
                                        data.target.setPermissions().catch(() => { })
                                    }
                                    if (data.key == 'mentionable') {
                                        data.target.setMentionable(false)
                                    }
                                    if (data.key == 'guild_rename') {
                                        data.target.guild.setName(data.target.guild.name)
                                    }
                                    if (data.key == 'guild_changeavt') {
                                        data.target.guild.setIcon(data.target.guild.iconURL({size : 4096, extension : 'gif'}))
                                    }
                                    if ((data.key == 'channel_rename') || (data.key == 'role_rename')) {
                                        data.target.setName(data.target.name)
                                    }
                                    t.deleteNuke(data)
                                    const embed = new Discord.EmbedBuilder()
                                        .setColor("Aqua")
                                        .setAuthor({ iconURL: yourauth.user.displayAvatarURL(), name: yourauth.user.username })
                                        .setTitle(`<:Warning:967085824812392469> Warning`)
                                        .setDescription(`Dectected dangerous action and punished`)
                                        .addFields(
                                            {
                                                name: `<:DedicatedServer:974605794324676689> Server`,
                                                value: `┕ ${data.target.guild.name}`,
                                                inline: true
                                            },
                                            {
                                                name: `<:Users:965087966588436511> User`,
                                                value: `┕ ${executor}\n┕ \`${executor.id}\``,
                                                inline: true
                                            },
                                            {
                                                name: `<:staff:1002421264096432240> Moderator`,
                                                value: `┕ ${yourauth.user}\n┕ \`${yourauth.user.id}\``,
                                                inline: true
                                            },
                                            {
                                                name: `<a:here:907106477867687956> Reason`,
                                                value: `┕ Trigged ${features.antinuke[data.key].name}`,
                                                inline: true
                                            },
                                            {
                                                name: `<:danger:948155485633253457> Action`,
                                                value: `┕ \`${settings.action}\``,
                                                inline: true
                                            }
                                        )
                                        .setFooter({ iconURL: yourauth.user.displayAvatarURL(), text: `${yourauth.user.username} - The best moderation Discord Bot made in Vietnam!` })
                                    t.send.toLogs({ target: data.target, type: `yourauth`, embed: embed })
                                    if (statics[0][`antinuke.sendOwner`]) t.send.toOwner({ target: data.target, embed: embed })
                                    if (statics[0][`antinuke.sendTarget`]) t.send.toTarget({ target: data.target, user: executor, embed: embed })
                                })
                            })
                        })
                        setTimeout(() => {
                            cache.del(`antinuke_rate_${data.key}_${data.target.guild.id}`)
                        }, parseInt(settings.time_limit) * 60000)
                    })
                }
            })
        },
        antiRaid: async function (data) {
            yourauth.mysql.query(`SELECT * FROM server_antiraid_config WHERE guild_id=${data.target.guild.id} `, async function (err, antiraid) {
                if (!antiraid[0]) return
                if (parseInt(antiraid[0]?.isEnabled) !== 1) return;
                if (parseInt(antiraid[0][data.key]) !== 1) return;
                t.punish.antiraid({
                    user: data.target,
                    target: data.target,
                    punishment: antiraid[0][`${data.key}.action`],
                    key: data.key,
                    reason: `[Trigged AntiRaid ${data.key}]`
                }).then(() => {
                    const embed = new Discord.EmbedBuilder()
                        .setColor("Aqua")
                        .setAuthor({ iconURL: yourauth.user.displayAvatarURL(), name: yourauth.user.username })
                        .setTitle(`<:Warning:967085824812392469> ANTIRAID`)
                        .setDescription(`> ${data.target} [\`${data.target.user.id}\`] was punished for \`${data.key}\``)
                        .setFooter({ iconURL: yourauth.user.displayAvatarURL(), text: `${yourauth.user.username} - The best moderation Discord Bot made in Vietnam!` })
                    t.send.toLogs({ type: 'mod', target: data.target, embed: embed })
                    t.send.toTarget({ target: data.target, user: data.target, embed: embed })
                })
            })
        },
        automod: async function (data) {
            yourauth.mysql.query(`SELECT * FROM server_automod_config WHERE guild_id=${data.target.guild.id} `, async function (err, automod) {
                if (!automod[0]) return
                if (parseInt(automod[0]?.isEnabled) !== 1) return;
                if (parseInt(automod[0][data.key]) !== 1) return;
                if (!data.target.member.kickable || !data.target.member.bannable) return
                data.target.delete()
                if (automod[0][data.key]) data.target.channel.bulkDelete(parseInt(automod[0][`${data.key}.limit`]) + 2, true).catch(e => { })
                data.target.channel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("Aqua")
                            .setTitle(`${data.target.member.user.username}`)
                            .setDescription(`You have been punished for \`${data.key}\``)
                    ]
                })
                t.punish.automod({
                    user: data.target.member,
                    target: data.target,
                    punishment: automod[0][`${data.key}.action`],
                    key: data.key,
                    reason: `[Trigged automod ${data.key}]`
                }).then(() => {
                    data.target.channel.permissionOverwrites.delete(data.target.member)
                    const embed = new Discord.EmbedBuilder()
                        .setColor("Aqua")
                        .setAuthor({ iconURL: yourauth.user.displayAvatarURL(), name: yourauth.user.username })
                        .setTitle(`<:Warning:967085824812392469> AUTOMOD`)
                        .setDescription(`> ${data.target.member} [\`${data.target.member.user.id}\`] was punished for \`${data.key}\``)
                        .setFooter({ iconURL: yourauth.user.displayAvatarURL(), text: `${yourauth.user.username} - The best moderation Discord Bot made in Vietnam!` })
                    t.send.toLogs({ type: 'mod', target: data.target, embed: embed })
                    t.send.toTarget({ target: data.target, user: data.target.member, embed: embed })
                })
            })
        }
    },
    fetchAuditLog: async function (data) {
        const AuditLogFetch = await data.target.guild.fetchAuditLogs({
            limit: 1,
            type: data.auditKey
        });
        if (!AuditLogFetch.entries.first()) return
        const Entry = await AuditLogFetch.entries.first();
        return Entry.executor
    },
    punish: {
        isolated: async function (data) {
            yourauth.mysql.query(`SELECT * FROM server_statics_config WHERE guild_id=${data.target.guild.id}`, async (err, statics) => {
                data.user.roles.add(statics[0]?.hardmute_role, data.reason).catch(() => {})
                data.user.roles.cache.forEach(roles => {
                    yourauth.mysql.query(`INSERT INTO pre_punished_role(user_id, guild_id, role_id, isManaged, permissions) VALUES (${data.user.id}, ${data.target.guild.id}, ${roles.id}, ${roles.managed ? 1 : 0}, ${roles.permissions.bitfield})`)
                    try {
                        data.user.roles.remove(roles.id, data.reason).catch(e => { })
                    } catch (error) {

                    }
                    if (data.user.user.bot) {
                        try {
                            if (roles.tags.botId) {
                                roles.setPermissions([""]).catch(e => { })
                            }
                        } catch (error) {

                        }
                    }
                })
            })
        },
        antinuke: async function (data) {
            yourauth.mysql.query(`INSERT INTO punished_log(guild_id, user_id, punishment, punishAt, reason) VALUES (${data.target.guild.id}, ${data.user.id}, '${data.punishment}', ${Date.now()}, '${data.reason}')`)
            if (data.punishment == 'ban') {
                data.user.ban({ reason: data.reason }).catch(() => { return })
            } else if (data.punishment == 'kick') {
                data.user.kick(data.reason).catch(() => { return })
            } else if (data.punishment == 'mute') {
                t.punish.isolated(data)
            }
        },
        antiraid: async function (data) {
            yourauth.mysql.query(`INSERT INTO punished_log(guild_id, user_id, punishment, punishAt, reason) VALUES (${data.target.guild.id}, ${data.user.id}, '${data.punishment}', ${Date.now()}, '${data.reason}')`)
            if (data.punishment == 'ban') {
                data.user.ban({ reason: data.reason }).catch(() => { return })
            } else if (data.punishment == 'kick') {
                data.user.kick(data.reason).catch(() => { return })
            } else if (data.punishment == 'mute') {
                data.user.timeout(ms(`7d`), data.reason).catch(() => { return })
            }
        },
        automod: async function (data) {
            yourauth.mysql.query(`SELECT * FROM server_statics_config WHERE guild_id=${data.target.guild.id}`, async (err, statics) => {
                yourauth.mysql.query(`INSERT INTO punished_log(guild_id, user_id, punishment, punishAt, reason) VALUES (${data.target.guild.id}, ${data.user.id}, '${data.punishment}', ${Date.now()}, '${data.reason}')`)
                if (data.punishment == 'ban') {
                    data.user.ban({ reason: data.reason }).catch(() => { return })
                } else if (data.punishment == 'kick') {
                    data.user.kick(data.reason).catch(() => { return })
                } else if (data.punishment == 'mute') {
                    data.user.timeout(parseInt(statics[0][`automod.timeout`]), data.reason)
                }
            })
        },
    },
    send: {
        toLogs: async function (data) {
            yourauth.mysql.query(`SELECT * FROM server_statics_config WHERE guild_id =${data.target.guild.id}`, async function (err, statics) {
                if (data.type == 'mod') {
                    const channel = await data.target.guild.channels.cache.get(statics[0][`log_mod.id`])
                    if (!channel) return
                    const webhooks = await channel.fetchWebhooks()
                    const webhook = await webhooks.find((webhook) => webhook.name === yourauth.user.username)
                    if (!webhook) {
                        channel.createWebhook({
                            name: yourauth.user.username,
                            avatar: yourauth.user.displayAvatarURL({ extension: 'png' })
                        }).then(wh => {
                            wh.send({ embeds: [data.embed] }).catch(() => { })
                        })
                    } else {
                        webhook.send({ embeds: [data.embed] }).catch(() => { })
                    }
                } else if (data.type == 'yourauth') {
                    const channel = await data.target.guild.channels.cache.get(statics[0][`log_yourauth.id`])
                    if (!channel) return
                    const webhooks = await channel.fetchWebhooks()
                    const webhook = await webhooks.find((webhook) => webhook.name === yourauth.user.username)
                    if (!webhook) {
                        channel.createWebhook({
                            name: yourauth.user.username,
                            avatar: yourauth.user.displayAvatarURL({ extension: 'png' })
                        }).then(wh => {
                            wh.send({ embeds: [data.embed] }).catch(() => { })
                        })
                    } else {
                        webhook.send({ embeds: [data.embed] }).catch(() => { })
                    }
                }
            })
        },
        toOwner: async function (data) {// check xem có gửi không ở mysql
            if (!data.target || !data.embed) return;
            const user = await data.target.guild.members.fetch(data.target.guild.ownerId)
            if (!user) return;
            user.send({
                embeds: [data.embed]
            })
                .catch(e => {
                    return { success: false }
                })
                .then(() => {
                    return { success: true }
                })
        },
        toTarget: async function (data) {
            if (!data.user || !data.embed) return;
            const user = await yourauth.users.cache.get(data.user.id)
            if (!user) return;
            user.send({
                embeds: [data.embed]
            })
                .catch(e => {
                    return { success: false }
                })
                .then(() => {
                    return { success: true }
                })
        },
    },
    deleteNuke: async function (data) {
        if (data.key == 'channel_create') {
            data.target.guild.channels.cache.forEach(ch => {
                const createAt = new Date(ch.createdTimestamp).getTime()
                const timeSpan = ms(`30 seconds`)
                const now = Date.now() - createAt
                if (now < timeSpan) {
                    try {
                        ch.delete().catch(() => { })
                    } catch {

                    }

                }
            })
        } else if (data.key == 'role_create') {
            data.target.guild.roles.cache.forEach(ch => {
                const createAt = new Date(ch.createdTimestamp).getTime()
                const timeSpan = ms(`30 seconds`)
                const now = Date.now() - createAt
                if (now < timeSpan) {
                    try {
                        ch.delete().catch(() => { })
                    } catch {

                    }

                }
            })
        }
    },
    prefixCommandValidation: async function (data) {

    },
    slashCommandValidation: async function (data, next) {
        const me = data.interaction.guild ? await data.interaction.guild.members.fetchMe() : null
        yourauth.mysql.query(`SELECT * FROM guild_premium WHERE guild_id=${data.interaction.guild ? data.interaction.guild.id : null}`, async (err, premium) => {
            yourauth.mysql.query(`SELECT * FROM user_vote WHERE user_id=${data.interaction.user.id}`, async (err, vote) => {
                yourauth.mysql.query(`SELECT * FROM user_class WHERE user_id=${data.interaction.user.id}`, async (err, user_class) => {
                    yourauth.mysql.query(`SELECT * FROM user_permit WHERE user_id=${data.interaction.user.id} && guild_id=${data.interaction.guild ? data.interaction.guild.id : null}`, async (err, permit) => {
                        if (data.command.limit.includes("executors") && !user_class[0]?.isOwner && !user_class[0]?.isDeveloper && !user_class[0]?.isAdmin) {
                            return data.interaction.reply({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setColor("Aqua")
                                        .setAuthor({ name: 'Permissions denied' })
                                        .setDescription(`> \`❌\` This command is not for you!\n> You are missing \`Executors\``)
                                        .setFooter({ text: data.interaction.user.tag, iconURL: data.interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                ],
                                ephemeral: true
                            })
                        }
                        if (data.command.limit.includes("inGuild") && !data.interaction.guild) {
                            return data.interaction.reply({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setColor("Aqua")
                                        .setAuthor({ name: 'Permissions denied' })
                                        .setDescription(`> \`❌\` This command is in guild only!\n> You must go to a guild and use this command`)
                                        .setFooter({ text: data.interaction.user.tag, iconURL: data.interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                ],
                                ephemeral: true
                            })
                        }
                        if (data.command.limit.includes("trusted") && (parseInt(permit[0]?.permit) < 8) && (data.interaction.guild.ownerId !== data.interaction.user.id) && !user_class[0]?.isOwner && !user_class[0]?.isDeveloper && !user_class[0]?.isAdmin) {
                            return data.interaction.reply({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setColor("Aqua")
                                        .setAuthor({ name: 'Permissions denied' })
                                        .setDescription(`> \`❌\` This command is in guild only!\n> You must go to a guild and use this command`)
                                        .setFooter({ text: data.interaction.user.tag, iconURL: data.interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                ],
                                ephemeral: true
                            })
                        }
                        if (data.command.limit.includes("premium") && data.interaction.guild) { // chx xong
                            return data.interaction.reply({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setColor("Aqua")
                                        .setAuthor({ name: 'Permissions denied' })
                                        .setDescription(`> \`❌\` This command is for premium guild!\n> This guild have to buy premium to use`)
                                        .setFooter({ text: data.interaction.user.tag, iconURL: data.interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                ],
                                ephemeral: true
                            })
                        }

                        if (data.command.limit.includes("voter") && ((parseInt(vote[0]?.voteAt || 0) + 43200000) < Date.now()) && !premium[0]) {
                            return data.interaction.reply({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setColor("Aqua")
                                        .setAuthor({ name: 'Permissions denied' })
                                        .setDescription(`> \`❌\` You must vote for me to use this command!\n> Vote me : https://top.gg/bot/935854694914461806/vote`)
                                        .setFooter({ text: data.interaction.user.tag, iconURL: data.interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                ],
                                ephemeral: true
                            })
                        }
                        if (!data.interaction.member.permissions.has((data.command.UserPerms || [])) && !user_class[0]?.isOwner && !user_class[0]?.isDeveloper && !user_class[0]?.isAdmin) {
                            return data.interaction.reply({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setColor("Aqua")
                                        .setAuthor({ name: 'Permissions denied' })
                                        .setDescription(`> \`❌\` You need \`${data.command.UserPerms || []}\` to use this command!`)
                                        .setFooter({ text: data.interaction.user.tag, iconURL: data.interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                ],
                                ephemeral: true
                            })
                        }
                        if (!me.permissions.has(data.command.BotPerms || [])) {
                            return data.interaction.reply({
                                embeds: [
                                    new Discord.EmbedBuilder()
                                        .setColor("Aqua")
                                        .setAuthor({ name: 'Permissions denied' })
                                        .setDescription(`> \`❌\` I need \`${data.command.BotPerms || []}\` to use this command!`)
                                        .setFooter({ text: data.interaction.user.tag, iconURL: data.interaction.user.displayAvatarURL({ extension: 'png', size: 4096 }) })
                                ],
                                ephemeral: true
                            }).catch(e => { })
                        }
                        // } else {
                        const args = [];

                        for (let option of data.interaction.options.data) {
                            if (option.type === 'SUB_COMMAND') {
                                if (option.name) args.push(option.name);
                                option.options?.forEach(x => {
                                    if (x.value) args.push(x.value);
                                });
                            } else if (option.value) args.push(option.value);
                        }
                        return data.command.run(yourauth, data.interaction, args)
                        // }
                    })
                })
            })
        })

    },
    toFancyNumber: async function (num) {
        return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatBytes: async function (a, b) {
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