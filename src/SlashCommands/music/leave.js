const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
    constructor(client) {
      super(client, {
        name: 'leave',
        description: 'Tira o bot da call.'
      })
    }
  
    run = async ({ client: client, msg: msg }) => {

        const player = client.music.players.get(msg.guild.id);

        if (!player || !player.current) return msg.editReply({content: `Não estou tocando música.`});

        if (!msg.member.voice.channel || msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({content: 'Você não está conectado na mesma call que eu, ou não está em uma call.'});

        if (msg.member.voice.selfDeaf) return msg.editReply({content: 'Você está com o fone desligado, ligue para parar as músicas.'});

        const stop = () => {
            const embed = new Discord.EmbedBuilder()
              .setDescription('Músicas paradas com sucesso, estou saindo.')
              .setColor('Red');
            msg.editReply({embeds: [embed]});
            if (player.queue) {
              if (player.queue.tracks[0]) player.queue.clear();
            };
            if (player.queueRepeat) player.setQueueLoop(false);
            if (player.trackRepeat) player.setTrackLoop(false);
            player.destroy();
        };
        stop();
    }

}