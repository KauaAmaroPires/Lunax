const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      description: 'Vê as informações da música atual.'
    })
  }

  run = async ({ client: client, msg: msg }) => {

    if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.EmbedLinks)) return msg.editReply({content: 'Eu preciso da permissão `EMBED_LINKS`.'});

      const player = client.music.players.get(msg.guild.id);

      if (!player || !player.current) return msg.editReply({content: `Não estou tocando música.`});

      const track = player.current;

      let URL = `${track.uri}`;
      let THUMB = player.current.thumbnail;

      const requesterid = await client.getUser(track.requester.id, undefined, true);
      const requester = requesterid.tag || track.requester.id;

      if (player.radio || track.isStream) {

        let title = track.title;
        let radioInfo = {};

        if (player.radio) {
          const info = await client.music.getNowplayingRadio({ name: title });
          radioInfo.title = info.title;
          radioInfo.thumb = info.thumb;
        };

        const embed = new Discord.EmbedBuilder()
          .setTitle('Tocando agora.')
          .setDescription('Música que está tocando agora.')
          .setThumbnail(radioInfo.thumb || THUMB)
          .setColor(client.config.EMBED_COLOR)
          .addFields([
            {
              name: `Nome:`,
              value: `${radioInfo.title || title}`
            },
            {
              name: `Requisitado por:`,
              value: `${requester}`
            }
          ])
          .setTimestamp(new Date)
          .setFooter({text: `${msg.user.tag}`, iconURL: msg.user.displayAvatarURL() });

        msg.editReply({embeds: [embed]});

        return;

      } else {

        let DURA = `\`${msToHour(player.position)}\` **${progressBarEnhanced((player.position / 1000) / 50, (track.duration / 1000) / 50, 12)}** \`${msToHour(track.duration)}\``;

        const embed = new Discord.EmbedBuilder()
          .setTitle('Tocando agora.')
          .setDescription('Música que está tocando agora.')
          .setThumbnail(THUMB)
          .setColor(client.config.EMBED_COLOR)
          .addFields([
            {
              name: `Nome:`,
              value: `[${track.title}](${URL})`
            },
            {
              name: `Requisitado por:`,
              value: `${requester}`
            },
            {
              name: `Duração:`,
              value: DURA
            }
          ])
          .setTimestamp(new Date)
          .setFooter({text: `${msg.user.tag}`, iconURL: msg.user.displayAvatarURL() });

        msg.editReply({embeds: [embed]});

      }

  }

};

const msToHour = (time) => {
    time = Math.round(time / 1000);
    const s = time % 60,
    m = ~~((time / 60) % 60),
    h = ~~(time / 60 / 60);
    return h === 0 ? `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(Math.abs(h) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
  
const progressBarEnhanced = (current, total, barSize) => {
    const progress = Math.round((barSize * current) / total);
    return (
        "━".repeat(process > 0 ? process - 1 : progress) + "🔘" + "━".repeat(barSize - progress)
    )
};