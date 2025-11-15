const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      description: 'Ativa o loop na música atual.'
    })
  }

  run = async ({ client: client, msg: msg }) => {

    try {

        const player = client.music.players.get(msg.guild.id);

        if (!player || !player.current) return msg.editReply({content: `Não estou tocando música.`});

        if (!msg.member.voice.channel || msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({content: 'Você não está conectado na mesma call que eu, ou não está em uma call.'});

        if (msg.member.voice.selfDeaf) return msg.editReply({content: 'Você está com o fone desligado, ligue para escutar as músicas.'});

        if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Connect)) return msg.editReply({content: 'Eu preciso da permissão de `conectar` e `falar`.'});

        if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Speak)) return msg.editReply({content: 'Eu preciso da permissão `conectar` e `falar`.'});

        if (player.radio) return msg.editReply({ content: 'não pode ser executado o comando por conta que você está escutando rádio.' });

        if (player.trackRepeat) {

          player.setTrackLoop(false);

          const embed = new Discord.EmbedBuilder()
            .setColor('Green')
            .setDescription('Loop desativado com sucesso.');

          msg.editReply({embeds: [embed]});

          return;

        } else {

          player.setTrackLoop(true);

          const embed = new Discord.EmbedBuilder()
            .setColor('Green')
            .setDescription(`Loop ativado com sucesso.`);

          msg.editReply({embeds: [embed]});

          return;

        }

      } catch (e) {
        console.log(e);
        msg.editReply({content: 'Ocorreu um erro, tente novamente.'});
      }

  }

}