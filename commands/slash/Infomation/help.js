const Discord = require("discord.js")
const fs = require('fs');
const yourauth = require("../../../yourauth")
const prefix = '/'
module.exports = {
    name: "help",
    description: "Show all commands",
    limit: ['inGuild'],
    UserPerms : [''],
    BotPerms : [''],
    options: [
        {
            name: 'command',
            description: 'Command',
            type: Discord.ApplicationCommandOptionType.String,
            required: false
        }
    ],
    /**
     * @arg {Discord.Client} client
     * @arg {Discord.Interaction} interaction
     */
    run: async (client, interaction, args, err) => {
    // console.log(yourauth.i18n.__("hello"))
        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setStyle("Link")
                .setURL(`https://yourauth.xyz/invite`)
                .setEmoji('<:LinkVIP:915188532228792330>')
                .setLabel('Invite'),
            new Discord.ButtonBuilder()
                .setStyle("Link")
                .setURL(yourauth.config.infomation.support)
                // .setEmoji(yourauth.emoji.general.support)
                .setLabel('Community'),
            new Discord.ButtonBuilder()
                .setStyle("Link")
                .setURL(yourauth.config.infomation.docs)
                // .setEmoji(yourauth.emoji.general.guide)
                .setLabel('Link'),
        )
        const embed = new Discord.EmbedBuilder()
            .setThumbnail(yourauth.user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' }))
            .setAuthor({ name: `${yourauth.user.username}`, iconURL: yourauth.user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' }) })
            .setFooter({ text: `${yourauth.user.username} - Best protector Discord bot`, iconURL: yourauth.user.displayAvatarURL({ size: 4096, dynamic: true, format: 'png' }) })
            .setColor("Aqua")
        const commandInput = interaction.options.getString("command")
        if (!commandInput) {
            let categories = [];

            fs.readdirSync("./commands/slash/").forEach((dir) => {
                if (dir == 'Owner') return
                const commands = fs.readdirSync(`./commands/slash/${dir}/`).filter((file) =>
                    file.endsWith(".js")
                );

                const cmds = commands.map((command) => {
                    let file = require(`../../slash/${dir}/${command}`);

                    if (!file.name) return "";

                    let name = file.name.replace(".js", "");

                    return `\`${name}\``;
                });

                let data = new Object();

                data = {
                    name: `<a:here:907106477867687956> [\`឵឵឵${dir.toUpperCase()}\`]`,
                    value: `> ┕ ឵឵឵${cmds.length === 0 ? "No command." : cmds.join(" ")}`
                };

                categories.push(data);
            });

            embed.setTitle("<a:rc_deco_Dot:915487929248391178> Need help? Here are all of my commands:")
                .addFields(categories)
                .setTimestamp()
                .setImage(`https://i.imgur.com/mhCpMX1.jpg`)
            return interaction.reply({ embeds: [embed], components: [row] });
        } else {
            const command =
                client.commands.get(commandInput.toLowerCase()) ||
                client.commands.find(
                    (c) => c.aliases && c.aliases.includes(commandInput.toLowerCase())
                );

            if (!command) {
                embed.setDescription(`> \`❌\` Invalid command! Use \`${prefix}help\` for all of my commands!`)
                return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
            }

            embed.setTitle(`Command \`${command.name ? `${command.name}` : "No name for this command."}\`:`)
                .addFields(
                    {
                        name: '> DESCRIPTION:',
                        value: command.description ? `\`${command.description}\`` : `\`No description for this command\``,
                    },
                    {
                        name: '> USAGE:',
                        value: command.usage ? `\`${prefix}${command.name} ${command.usage}\`` : `\`${prefix}${command.name}\``,
                    },
                )

                .setTimestamp()
            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
    }
}
