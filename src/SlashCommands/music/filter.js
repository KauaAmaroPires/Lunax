const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'filter',
      description: 'Adiciona um filtro de som na música.',
      options: [
        {
            name: 'filter',
            description: 'pesquisar filtro que você quer usar',
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Nightcore',
                    value: 'nightcore'
                },
                {
                    name: 'Vaporwave',
                    value: 'vaporwave'
                },
                {
                    name: 'Grave',
                    value: 'bass'
                },
                {
                    name: 'POP',
                    value: 'pop'
                },
                {
                    name: 'Suave',
                    value: 'soft'
                },
                {
                    name: 'Contrabaixo',
                    value: 'treblebass'
                },
                {
                    name: '8D',
                    value: '8D'
                },
                {
                    name: 'Karaoke',
                    value: 'karaoke'
                },
                {
                    name: 'Vibrado',
                    value: 'vibrato'
                },
                {
                    name: 'Tremolo',
                    value: 'tremolo'
                },
                {
                    name: 'RESET',
                    value: 'RESET'
                },
            ],
            required: true
        }
      ]
    })
  }

  run = async ({ client: client, msg: msg }) => {

    if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.EmbedLinks)) return msg.editReply({content: 'Eu preciso da permissão `EMBED_LINKS`.'});

    const player = client.music.players.get(msg.guild.id);

    if (!player || !player.current) return msg.editReply({content: `Não estou tocando música.`});

    if (!msg.member.voice.channel || msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({content: 'Você não está conectado na mesma call que eu, ou não está em uma call.'});

    if (msg.member.voice.selfDeaf) return msg.editReply({content: 'Você está com o fone desligado, ligue para escutar as músicas.'});

    if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Connect)) return msg.editReply({content: 'Eu preciso da permissão de `conectar` e `falar`.'});

    if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Speak)) return msg.editReply({content: 'Eu preciso da permissão `conectar` e `falar`.'});

    if (player.radio) return msg.editReply({ content: 'não pode ser executado o comando por conta que você está escutando rádio.' });

    const filter = msg.options.getString('filter');

    if (filter == 'RESET') {
        if (player.effects[0]) {

            player.filters.clear();

            player.effects = [];

            const embed = new Discord.EmbedBuilder()
                .setDescription('Os filtros foram retirados com sucesso.')
                .setColor('#088A08')
                .setFooter({text: `${msg.user.tag}`, iconURL: msg.user.displayAvatarURL()})
                .setTimestamp(new Date);

            return msg.editReply({embeds: [embed]});
        } else {

            const embed = new Discord.EmbedBuilder()
                .setDescription('Não há filtros sendo usados.')
                .setColor('#DF0101')
                .setFooter({text: `${msg.user.tag}`, iconURL: msg.user.displayAvatarURL()})
                .setTimestamp(new Date);

            return msg.editReply({embeds: [embed]});

        }
    };

    player.filters.set(configs[filter]);
    player.effects = [filter];

    const embed = new Discord.EmbedBuilder()
        .setDescription('O filtro foi adicionado com sucesso.')
        .setColor('#088A08')
        .setFooter({text: `${msg.user.tag}`, iconURL: msg.user.displayAvatarURL()})
        .setTimestamp(new Date);

    msg.editReply({embeds: [embed]});

  }

}

const configs = {
    bass: {
        equalizer: [0.29, 0.23, 0.19, 0.16, 0.08],
    },
    pop: {
        equalizer: [-0.09, -0.09, -0.09, 0.02, 0.04, 0.16, 0.18, 0.22, 0.22, 0.18, 0.12, 0.02, -0.03, -0.06, -0.1],
    },
    soft: {
        equalizer: [0, 0, 0, 0, 0, 0, 0, 0, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25, -0.25],
    },
    treblebass: {
        equalizer: [0.55, 0.55, 0.5, 0.15, 0.3, 0.45, 0.23, 0.35, 0.45, 0.55, 0.55, 0.5, 0.10],
    },
    nightcore: {
        equalizer: [0.3, 0.3],
        timescale: { pitch: 1.2, rate: 1.1 },
        tremolo: { depth: 0.3, frequency: 14 },
    },
    vaporwave: {
        equalizer: [0.3, 0.3],
        timescale: { pitch: 0.5 },
        tremolo: { depth: 0.3, frequency: 14 },
    },
    lowpass: {
        lowPass: { smoothing: 15 }
    },
    '8D': { rotation: { rotationHz: .2 } },
    tremolo: {
        tremolo: {
            frequency: 10,
            depth: 0.5
        }
    },
    vibrato: {
        vibrato: {
            frequency: 10,
            depth: 0.9
        }
    },
    karaoke: {
        karaoke: {
            level: 1.0,
            monoLevel: 1.0,
            filterBand: 220.0,
            filterWidth: 100.0
        }
    }
};