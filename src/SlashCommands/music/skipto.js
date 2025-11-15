const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'skipto',
      description: 'Pula para uma posição específica da sua queue.',
      options: [
        {
            name: 'music',
            description: 'Qual música você quer tocar?',
            type: Discord.ApplicationCommandOptionType.Number,
            required: true,
            autocomplete: true,
        }
      ]
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

        let track = msg.options.getNumber('music');

        if (player.queue.length < (track + 1)) return msg.editReply({content: 'Posição inválida'})

        if (track + 1 <= 0) return msg.editReply({content: 'Só deve ser colocado números de 1 em diante'});

        const title = player.queue.tracks[track].title;

        player.skip(track + 1);

        if (player.radio) {
          player.radio = false;
          player.skip();
        };

        const embed = new Discord.EmbedBuilder()
          .setColor('Green')
          .setDescription(`Pulando para música: \`${title}\`...`);

        msg.editReply({embeds: [embed]});

      } catch (e) {

        console.log(e);

        msg.editReply({content: 'Ocorreu um erro, tente novamente.'});

      }

  }

  async runAutoComplete({ client: client, interaction: interaction, value: value }) {

    const player = client.music.players.get(interaction.guild.id);

    if (!player || !player.queue.tracks[0]) return interaction.respond([]);

    if (!value) {
        interaction.respond([]);
        return;
    };

    const choices = [];
    let index = 0;

    for (let i = 0; i < player.queue.tracks.length; i++) {
        const track = player.queue.tracks[i];
        if (index >= 25) break;
        if (track.title.toLowerCase().includes(value.trim().toLowerCase())) {
            choices.push({
                name: track.title,
                value: i
            });
            index ++;
        }
    };

    interaction.respond(choices);

  }

}