const Command = require('../../structures/Slash.js');
const Discord = require('discord.js');

module.exports = class extends Command {
    constructor(client) {
      super(client, {
        name: 'autoplay',
        description: 'Ativa/desativa o autoplay no player de música.'
      })
    }
  
    run = async ({ client: client, msg: msg }) => {

        const player = client.music.players.get(msg.guild.id);

        if (!player || !player.current) return msg.editReply({ content: `Não estou tocando música.` });

        if (!msg.member.voice.channel || msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({ content: 'Você não está conectado na mesma call que eu, ou não está em uma call.' });

        if (msg.member.voice.selfDeaf) return msg.editReply({ content: 'Você está com o fone desligado, ligue para escutar as músicas.' });

        if (player.radio) return msg.editReply({ content: 'não pode ser executado o comando por conta que você está escutando rádio.' });

        if (player.autoplay?.status) {

            player.autoplay.status = false;
            player.autoplay.track = null;

            const embed = new Discord.EmbedBuilder()
                .setDescription('Autoplay desativado com sucesso.')
                .setColor('Green');

            msg.editReply({ embeds: [embed] });

        } else {

            player.autoplay = {
                status: true,
                track: player.current,
                req: client.user
            };

            const embed = new Discord.EmbedBuilder()
                .setDescription('Autoplay ativado com sucesso.')
                .setColor('Green');

            if (player.queueRepeat) player.setQueueLoop(false);
            if (player.trackRepeat) player.setTrackLoop(false);

            msg.editReply({ embeds: [embed] });
        
        }

    }

}