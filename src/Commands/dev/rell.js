const Discord = require('discord.js');

module.exports = {
    name: "rell",
    aliases: ["rell"],

    run: async ({ client: client, msg: msg, args: args }) => {

        if (!client.config.DEVELOPERS.includes(msg.member.id)) return;

        const rell = new Discord.EmbedBuilder()
            .setTitle('Status')
            .setDescription(`Usuários: ${client.guilds.cache.map((x) => x.memberCount).reduce((x, f) => x + f)}\nServidores: ${client.guilds.cache.size}\nCanais: ${client.channels.cache.size}\nMemória RAM: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB\nCPU: ${(process.cpuUsage().system / 1024 / 1024).toFixed(2)}% de CPU\n\nPing: \n\n:bar_chart: Ping do servidor: \`${Date.now() - msg.createdTimestamp}ms\n\n\`:stopwatch: Ping da API: \`${Math.round(client.ws.ping)}ms\``)
            .setColor(client.config.EMBED_COLOR);

        msg.reply({embeds: [rell]})
    }
}
