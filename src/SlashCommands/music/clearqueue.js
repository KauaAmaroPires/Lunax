const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
    constructor(client) {
      super(client, {
        name: 'clearqueue',
        description: 'Limpa a queue de músicas atual do servidor.'
      })
    }
  
    run = async ({ client: client, msg: msg }) => {

        try {

            const player = client.music.players.get(msg.guild.id);
    
            if (!player || !player.queue.tracks[0]) return msg.editReply({content: `Não encontrei nenhuma queue.`});
    
            if (!msg.member.voice.channel || msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({content: 'Você não está conectado na mesma call que eu, ou não está em uma call.'});
    
            if (msg.member.voice.selfDeaf) return msg.editReply({content: 'Você está com o fone desligado, ligue para escutar as músicas.'});
    
            if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Connect)) return msg.editReply({content: 'Eu preciso da permissão de `conectar` e `falar`.'});
    
            if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Speak)) return msg.editReply({content: 'Eu preciso da permissão `conectar` e `falar`.'});
    
            if (player.queueRepeat) player.setQueueLoop(false);
    
            player.queue.clear();
    
            const embed = new Discord.EmbedBuilder()
              .setColor('Green')
              .setDescription(`Queue limpa com sucesso.`);
    
            msg.editReply({embeds: [embed]});
    
        } catch (e) {
            console.log(e);
            msg.editReply({content: 'Ocorreu um erro, tente novamente.'});
        }

    }

}