// const Discord = require("discord.js")
// const yourauth = require("../../../yourauth")
// module.exports = {
//     name: "kick",
//     description: "Kick a user from server",
//     limit: ['inGuild'],
//     UserPerms : ['KickMembers'],
//     BotPerms : ['KickMembers'],
//     options: [
//         {
//             name: 'user',
//             description: 'Provide an ID or a user',
//             type: Discord.ApplicationCommandOptionType.User,
//             required: true,
//         },
//         {
//             name: 'reason',
//             description: 'Why you\'re kicking this user?',
//             type: Discord.ApplicationCommandOptionType.String,
//             required: false,
//         },
//         {
//             name: 'DM',
//             description: 'Send a kicked message to user',
//             type: Discord.ApplicationCommandOptionType.String,
//             required: false,
//             choice : [
//                 {
//                     name : "true",
//                     value : "true"
//                 },
//                 {
//                     name : "false",
//                     value : "false"
//                 }
//             ]
//         }
//     ],
//     /**
//      * @arg {Discord.Client} client
//      * @arg {Discord.Interaction} interaction
//      */
//     run: async (client, interaction, args, err) => {
//         const member = await interaction.guild.members.fetch(interaction.options.getUser('user')).catch(() => {
//             interaction.reply({
//                 embeds : [
//                     new Discord.EmbedBuilder()
//                         .setColor("Aqua")
//                         .setTitle("Kick error")
//                         .setDescription(`> The user provided can not be found!`)
//                 ],
//             })
//         });
//         if (!member) return
//         const reason = interaction.options.getString('reason')
//         let type
//         const row = new Discord.ActionRowBuilder().addComponents(
//             new Discord.ButtonBuilder()
//                 .setStyle("Danger")
//                 .setCustomId("yes")
//                 .setLabel('Yes'),
//             new Discord.ButtonBuilder()
//                 .setStyle("Success")
//                 .setCustomId("no")
//                 .setLabel('No'),
//         )
//         const message = await interaction.reply({
//             embeds : [
//                 new Discord.EmbedBuilder()
//                     .setColor("Aqua")
//                     .setTitle("Are you sure?")
//                     .setDescription(`> ${member} will be kicked with reason: \`${reason}\``)
//             ],
//             components : [row]
//         })
//         const collector = await message.createMessageComponentCollector({
//             componentType: "BUTTON",
//             time: ms('10s'),
//         })
//         collector.on('collect', collection => {
//             if (collection.user.id !== interaction.user.id) return
//             if (collection.customId === 'yes') {
                
//             } else if (collection.customId === 'no') {
                
//             }
//         })
//         collector.on('end', collected => {
//             return interaction.editReply({
//                 embeds: [
                    
//                 ],
//                 components : []
//             })
//         });
//     }
// }