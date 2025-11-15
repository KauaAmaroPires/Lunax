const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'shuffle',
      description: 'Embaralha a queue de forma aleatória.'
    })
  }

  run = async ({ client: client, msg: msg }) => {

    const player = client.music.players.get(msg.guild.id);

    if (!player || !player.queue.tracks[0]) return msg.editReply({content: `Não encontrei nenhuma playlist.`});

    if (!msg.member.voice.channel || msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({content: 'Você não está conectado na mesma call que eu, ou não está em uma call.'});

    if (msg.member.voice.selfDeaf) return msg.editReply({content: 'Você está com o fone desligado, ligue para embaralhar as músicas.'});

    player.queue.shuffle();

    const embed = new Discord.EmbedBuilder()
        .setDescription('Playlist embaralhada com sucesso.')
        .setColor('Green')

    msg.editReply({embeds: [embed]});

    return;

  }

}