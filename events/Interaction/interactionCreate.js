const yourauth = require('../../yourauth');
const Discord = require("discord.js")
const functions = require("../../utils/functions");
yourauth.on('interactionCreate', async (interaction) => {
    if (!interaction.isApplicationCommand()) return;
    const embed = new Discord.MessageEmbed()
        .setAuthor({ name: `${interaction.member.user.username}`, iconURL: interaction.member.user.displayAvatarURL() })
        .setFooter({ text: `${yourauth.user.username} - Best protector Discord bot`, iconURL: yourauth.user.displayAvatarURL() })
        .setColor("AQUA")

    if (!interaction.guild) {
        embed.setDescription(`> \`❌\` You can't use slash command in DMs`)
        return interaction.reply({
            embeds: [embed]
        })
    }
    if (interaction.isCommand() || interaction.isContextMenu()) {
        const command = yourauth.slashcommands.get(interaction.commandName);

        embed.setDescription('> \`❌\` An error occured while running this command')
        if (!command) return interaction.reply({
            embeds: [embed],
            ephemeral: true
        }) && yourauth.slashcommands.delete(interaction.commandName);;

        const args = [];

        for (let option of interaction.options.data) {
            if (option.type === 'SUB_COMMAND') {
                if (option.name) args.push(option.name);
                option.options?.forEach(x => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        if (command.ownerOnly && !yourauth.config.setting.globalExecutor.includes(interaction.member.id)) {
            if (!yourauth.yourauth.config.owner.includes(interaction.member.id)) {
                embed.setDescription(`> \`❌\` Only owner can use this command!`)
                return interaction.reply({ embeds: [embed], ephemeral: true })
            }
        }
        if (command.ownerGuild && !yourauth.config.setting.globalExecutor.includes(interaction.member.id)) {
            embed.setColor('RED')
            embed.setTitle(`**Permissions**`)
            embed.setDescription(`> \`❌\` Only owner can use this command!`)
            if (interaction.member.id !== interaction.guild.ownerId) {
                return interaction.reply({ embeds: [embed], ephemeral: true })
            }
        }
        if (command.voiceOnly && !yourauth.config.setting.globalExecutor.includes(interaction.member.id)) {
            embed.setColor('RED')
            embed.setTitle(`**Error**`)
            embed.setDescription(`> \`❌\` You need join to a voice to use this command!`)
            if (!interaction.member.voice.channel) {
                return interaction.reply({ embeds: [embed], ephemeral: true })
            }
        }
        if (command.nsfwOnly && !yourauth.config.setting.globalExecutor.includes(interaction.member.id)) {
            embed.setColor('RED')
            embed.setTitle(`**Error**`)
            embed.setDescription(`> \`❌\` This command only can used in NSFW Channel`)
            if (!interaction.channel.nsfw) {
                return interaction.reply({ embeds: [embed], ephemeral: true })
            }
        }

        if (!interaction.member.permissions.has((command.UserPerms || [])) && !yourauth.config.setting.globalExecutor.includes(interaction.member.id)) {
            embed.setTitle(`**Permissions**`)
            embed.setDescription(`You need: \`${command.UserPerms || []}\``)
            return interaction.reply({ embeds: [embed], ephemeral: true }).catch(err => { })
        }
        if (!interaction.guild.me.permissions.has(command.BotPerms || [])) {
            embed.setTitle(`**Permissions**`)
            embed.setDescription(`Bot need: \`${command.BotPerms || []}\``)
            return interaction.reply({ embeds: [embed], ephemeral: true }).catch(err => { })
        }
        command.run(yourauth, interaction, args)
    }
})
