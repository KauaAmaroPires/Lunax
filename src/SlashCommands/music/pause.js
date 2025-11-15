const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      description: 'Pausa a música atual.'
    })
  }

  run = async ({ client: client, msg: msg }) => {

    const player = client.music.players.get(msg.guild.id);

    if (!player || !player.current) return msg.editReply({content: `Não estou tocando música.`});

    if (!msg.member.voice.channel || msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({content: 'Você não está conectado na mesma call que eu, ou não está em uma call.'});

    if (msg.member.voice.selfDeaf) return msg.editReply({content: 'Você está com o fone desligado, ligue para pausar as músicas.'});

    if (player.paused) return msg.editReply({content: 'A música já está pausada.'});

    player.pause(true);

    const embed = new Discord.EmbedBuilder()
        .setDescription('Música pausada com sucesso.')
        .setColor('Green');

    msg.editReply({embeds: [embed]});

    return;

  }

}