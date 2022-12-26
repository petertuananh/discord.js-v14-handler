const Discord = require('discord.js')

module.exports = {
    name: 'invite',
    aliases: ['invite'],
    run: async (client, message, args) => {

        const embed0 = await new Discord.EmbedBuilder()
            .setAuthor({ name: "Invite", iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
            .setDescription("Xin chào!, Tôi là Yoimiya Bot bạn có thể thêm tôi tại nút **Invite** ở dưới đây. Cảm ơn :3 💝")
            // .setColor(`${client.config.color.default}`)

        const row = await new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setLabel("Invite")
                .setURL("https://discord.com/api/oauth2/authorize?client_id=922839705802919937&permissions=8&redirect_uri=https%3A%2F%2Fdiscord.com%2Foauth2%2Fauthorize&response_type=code&scope=bot%20applications.commands%20voice")
                .setStyle(Discord.ButtonStyle.Link)
        )

        await message.reply({ embeds: [embed0], components: [row] })
    }
}