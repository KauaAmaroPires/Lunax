const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      description: 'Aumenta ou baixa o som da música.',
      options: [
        {
            name: 'volume',
            description: 'alterar volume do player.',
            type: Discord.ApplicationCommandOptionType.Number,
            required: true
        }
      ]
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

        let posi = msg.options.getNumber('volume');

        if (!posi) return msg.editReply({content: 'Você precisa especificar um volume.'});

        if (posi <= 0) return msg.editReply({content: 'Só deve ser colocado números de 1 em diante'});

        if (posi > 500) return msg.editReply({content: 'O volume máximo e 500'});

        const volumeant = player.volume;

        if (posi === volumeant) return msg.editReply({content: `O volume \`${posi}\` já foi setado.`});

        player.filters.setVolume(posi);

        const embed = new Discord.EmbedBuilder()
          .setColor('Green')
          .setDescription(`Volume de \`${volumeant}\` para \`${posi}\` foi aplicado com sucesso.`);

        msg.editReply({embeds: [embed]});

      } catch (e) {
        console.log(e);
        msg.editReply({content: 'Ocorreu um erro, tente novamente.'});
      }

  }

}