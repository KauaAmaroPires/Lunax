const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      description: 'Mostra a latencia do servidor.'
    })
  }

  run = async ({ client: client, msg: msg }) => {

    if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.EmbedLinks)) return msg.editReply({content: 'Eu preciso da permissão `EMBED_LINKS`.'});

    const embed = new Discord.EmbedBuilder()
        .setDescription(":ping_pong: Pong!")
        .setColor(client.config.EMBED_COLOR);

    msg.editReply({embeds: [embed]}).then(() => {

        setTimeout(() => {

            let ping = new Discord.EmbedBuilder()
                .setDescription(`:bar_chart: Ping do servidor: \`${Date.now() - msg.createdTimestamp}ms\n\n\`:stopwatch: Ping da API: \`${Math.round(client.ws.ping)}ms\``)
                .setColor(client.config.EMBED_COLOR);

            msg.editReply({embeds: [ping]});

        }, 2000);

    });

  }
}