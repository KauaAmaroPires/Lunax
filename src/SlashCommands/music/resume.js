const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      description: 'Volta a tocar a música que estava pausada.'
    })
  }

  run = async ({ client: client, msg: msg }) => {

    const player = client.music.players.get(msg.guild.id);

    if (!player || !player.current) return msg.editReply({content: `Não estou tocando música.`});

    if (!msg.member.voice.channel || msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({content: 'Você não está conectado na mesma call que eu, ou não está em uma call.'});

    if (msg.member.voice.selfDeaf) return msg.editReply({content: 'Você está com o fone desligado, ligue para retomar as músicas.'});

    if (!player.paused) return msg.editReply({content: 'A música não está pausada.'});

    player.pause(false);

    const embed = new Discord.EmbedBuilder()
    .setDescription('Música retomada com sucesso.')
    .setColor('Green');

    msg.editReply({embeds: [embed]});

    return;

  }

}