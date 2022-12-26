const yourauth = require('../../yourauth');
const Discord = require("discord.js")
const functions = require("../../utils/functions")
yourauth.on('messageCreate', async (message) => {
    const embed = new Discord.MessageEmbed()
        .setColor(`AQUA`)


    if (message.channel.partial) await message.channel.fetch();
    if (message.partial) await message.fetch();
    const mentionRegPrefix = RegExp(`^<@!?${yourauth.user.id}> `);
    let botprefix = `y!`// chỗ này fetch mysql
    if (botprefix === null) {
        botprefix = yourauth.config.general.prefix
    };
    if (botprefix === 'pijdijidjsijdsis') {
        botprefix = ''
    };
    const prefix = message.content.match(mentionRegPrefix) ? message.content.match(mentionRegPrefix)[0] : botprefix;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = yourauth.commands.get(cmd.toLowerCase()) || yourauth.commands.find((cmds) => cmds.aliases && cmds.aliases.includes(cmd));
    if (!command) return;
    if (command) {
        // console.log(1)
        if (!message.guild.me.permissions.has(["SEND_MESSAGES", "EMBED_LINKS"])) {
            embed.setTitle(`**Permissions**`)
            embed.setDescription(`Bot need: \`SEND MESSAGES\``)
            return message.member.send({ embeds: [embed] }).catch(err => console.log(err))
        }
        if (!message.member.permissions.has(command.UserPerms || [])) {
            embed.setTitle(`**Permissions**`)
            embed.setDescription(`You need: \`${command.UserPerms || []}\``)
            return message.reply({ embeds: [embed] }).catch(err => console.log(err))
        }
        if (!message.guild.me.permissions.has(command.BotPerms || [])) {
            embed.setTitle(`**Permissions**`)
            embed.setDescription(`Bot need: \`${command.BotPerms || []}\``)
            return message.reply({ embeds: [embed] }).catch(err => console.log(err))
        }
        if (command.ownerGuild) {
            const trustedEmbed = new Discord.MessageEmbed()
            trustedEmbed.setColor('RED')
            trustedEmbed.setTitle(`**Permissions**`)
            trustedEmbed.setDescription(`Only owner can use this command!`)
            if (message.member.id !== message.guild.ownerId) {
                return message.reply({ embeds: [trustedEmbed] })
            }
        }
        if (command.ownerOnly) {
            if (!yourauth.config.setting.globalExecutor.includes(interaction.member.id)) {
                embed.setTitle(`**Permissions**`)
                embed.setDescription(`**・Limited this commands to owners only**`)
                return message.channel.send({
                    embeds: [embed]
                })
            }
        }
        command.run(yourauth, message, args, prefix);
    }
})