const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");
const { request } = require('undici');
const TrackQueue = require('../../structures/TrackQueue.js');
const Queue = new TrackQueue();
const { ConnectionState } = require('vulkava');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      description: '[🎶] Adicione uma música na fila.',
      options: [
        {
          name: 'search',
          description: 'Pesquise a música que deseja ouvir.',
          type: Discord.ApplicationCommandOptionType.String,
          required: false,
          autocomplete: true,
        },
        {
          name: 'url',
          description: 'Informe o nome ou URl da música que deseja ouvir.',
          type: Discord.ApplicationCommandOptionType.String,
          required: false
        }
      ],
    })
  }

  run = async ({ client: client, msg: msg }) => {

    if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.EmbedLinks)) return msg.editReply({content: 'Eu preciso da permissão `EMBED_LINKS`.'});

    const player2 = client.music.players.get(msg.guild.id);

    try {

      if (player2) {
        if (msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({ content: `${client.config.emoji.erro} **|** ${msg.user}, você deve estar no mesmo canal de voz que eu.`, ephemeral: true });
      }

      if (!msg.member.voice.channel) return msg.editReply({ content: `${client.config.emoji.erro} **|** ${msg.user}, você precisa se conectar a um canal de voz.`, ephemral: true });

      if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Connect)) return msg.editReply({content: 'Eu preciso da permissão de `conectar` e `falar`.'});

      if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Speak)) return msg.editReply({content: 'Eu preciso da permissão `conectar` e `falar`.'});

      const music = msg.options.getString('search') || msg.options.getString('url');

      if (!music) return msg.editReply({content: 'Coloque uma música ou URL.'});

      const result = await client.music.search(music);

      if (result.loadType === "LOAD_FAILED") return msg.editReply({content: 'Não consegui tocar a música'});
      if (result.loadType === "NO_MATCHES") return msg.editReply({content: 'Não encontrei a música'});

      msg.editReply({content: `Pesquisando \`[${music}]\``}).then((message) => {
        setTimeout(() => {
          message.delete().catch(O_o => {});
        }, 10000)
      });

      const createPlayer = () => {
        const player = client.music.createPlayer({
          guildId: msg.guild.id,
          voiceChannelId: msg.member.voice.channel.id,
          textChannelId: msg.channel.id,
          selfDeaf: true,
          queue: Queue
        });
  
        player.effects = [];
        return player;
      };

      const player = player2 || createPlayer();

      if (player.state === ConnectionState.DISCONNECTED) {

        let voiceChannel = client.channels.cache.get(msg.member.voice.channel.id);

        if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.Administrator) && voiceChannel.userLimit && msg.member.voice.channel.members.size >= voiceChannel.userLimit) {

          msg.editReply({content: 'O canal de voz está cheio.'});
          if (player.queue) {
            if (player.queue.tracks[0]) player.queue.clear();
          };
          if (player.queueRepeat) player.setQueueLoop(false);
          if (player.trackRepeat) player.setTrackLoop(false);
          player.destroy();
          return;

        }

        player.connect();

      }

      if (result.loadType === "PLAYLIST_LOADED") {

        if (player.radio) {
          player.radio = false;
          player.skip();
        };

        const playlist = result.playlistInfo;

        for (const track of result.tracks) {
          track.setRequester(msg.user);
          player.queue.add(track);
        }

        if (!player.playing) player.play()

        const embed = new Discord.EmbedBuilder()
          .setTitle('Playlist adicionada.')
          .setColor('Green')
          .setDescription(`\n**Nome:** \`${playlist?.name}\`\n**Quantidade de músicas:** \`${result.tracks.length}\`\n**Duração:** \`${formatTime(convertMilliseconds(playlist.duration), "hh:mm:ss")}\``)

        msg.channel.send({embeds: [embed]});

      } else {

        const tracks = result.tracks;

        if (player.radio) {
          player.radio = false;
          player.skip();
        };

        tracks[0].setRequester(msg.user)
        player.queue.add(tracks[0]);

        if (player2) {

          const tracktemp = player.queueDuration;

          const embed = new Discord.EmbedBuilder()
            .setDescription(`Música **${tracks[0].title}** Adicionada a playlist.\n\n**Duração: ** \`${formatTime(convertMilliseconds(tracktemp), "hh:mm:ss")}\``)
            .setColor('Green');

          msg.channel.send({embeds: [embed]});
        }

        if (!player.playing) player.play();

      }

    } catch(err) {
      if (err) console.log(err);
      return msg.editReply({content: 'Ocorreu um erro, tente novamente.'})
    }

  }

  async runAutoComplete({ interaction: interaction, value: value }) {

    if (!value) {
      interaction.respond([]);
      return;
    };

    const res = await request(`https://clients1.google.com/complete/search?client=youtube&hl=pt-PT&ds=yt&q=${encodeURIComponent(value)}`, {
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'
      }
    }).then(async e => Buffer.from(await e.body.arrayBuffer()).toString('utf8'));

    const choices = []

    const data = res.split('[');

    for (var i = 3, min = Math.min(8 * 2, data.length); i < min; i+= 2) {
      const choice = data[i].split('"')[1].replace(/\\u([0-9a-fA-F]{4})/g, (_, cc) => String.fromCharCode(parseInt(cc, 16)));

      if (choice) {
        choices.push({
          name: choice,
          value: choice
        })
      }
    }

    interaction.respond(choices);

  }
}

const convertMilliseconds = (ms) => {

  const seconds = ~~(ms / 1000);
  const minutes = ~~(seconds / 60);
  const hours = ~~(minutes / 60);

  return { hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60}

}

const formatTime = (time, format, twoDigits = true) => {

  const formats = {
    dd: "days",
    hh: "hours",
    mm: "minutes",
    ss: "seconds"
  }

  return format.replace(/dd|hh|mm|ss/g, (match) => time[formats[match]].toString().padStart(twoDigits ? 2 : 0, "0"));

}
