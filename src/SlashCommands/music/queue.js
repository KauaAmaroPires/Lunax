const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      description: 'Mostra a fila atual do servidor.'
    })
  }

  run = async ({ client: client, msg: msg }) => {

    if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.EmbedLinks)) return msg.editReply({content: 'Eu preciso da permissão `EMBED_LINKS`.'});

      const player = client.music.players.get(msg.guild.id);

      if (!player || !player.current) return msg.editReply({content: `Não estou tocando música.`});

      const getSongDetails = (pos, pos2) => {
        const data = [];

        for (; pos <= pos2 && player.queue.tracks[pos]; pos++) {

          const requester = player.queue.tracks[pos].requester;

          let URL = `${player.queue.tracks[pos].uri}`;

          let DESC = `**${pos + 1}°** - [${shorten(player.queue.tracks[pos].title, 25).replaceAll("[", "").replaceAll("]", "")}](${URL}) [${requester}]`;

          if (URL === undefined || URL === 'undefined') DESC = `**${pos + 1}°** - **${shorten(player.queue.tracks[pos].title, 25).replaceAll("[", "").replaceAll("]", "")}** [${requester}]`;

          if (player.queue.tracks[pos].radio) DESC = `**${pos + 1}°** - ${shorten(player.queue.tracks[pos].title, 25).replaceAll("[", "").replaceAll("]", "")} [${requester}]`;

          data.push(DESC);

        }

        return data.join('\n')

      }

      let URL = `${player.current.uri}`;

      if (player.radio || player.current.isStream) {

        const embed = new Discord.EmbedBuilder()
          .setAuthor({name: `[${player.queue.tracks.length}] Playlist do servidor`, iconURL: msg.guild.iconURL({dynamic: true})})
          .setColor('Random')
          .setDescription(`${player.queue.tracks.length <= 0 ? `Nenhuma música na fila.` : getSongDetails(0, 9)}\n\n> Música tocando agora: **${shorten(player.current.title)}**\n**Loop:**\n\`\`\`js\nLoop_music - ${player.trackRepeat}\nLoop_queue - ${player.queueRepeat}\`\`\``)

        msg.editReply({embeds: [embed]});

      } else {

        const embed = new Discord.EmbedBuilder()
          .setAuthor({name: `[${player.queue.tracks.length}] Playlist do servidor`, iconURL: msg.guild.iconURL({dynamic: true})})
          .setColor('Random')
          .setDescription(`${player.queue.tracks.length <= 0 ? `Nenhuma música na fila.` : getSongDetails(0, 9)}\n\n> Música tocando agora: **[${shorten(player.current.title)}](${URL})**\n> Duração da playlist: **${formatTime(convertMilliseconds(player.queueDuration), `hh:mm:ss`)}**\n**Loop:**\n\`\`\`js\nLoop_music - ${player.trackRepeat}\nLoop_queue - ${player.queueRepeat}\`\`\``)

        msg.editReply({embeds: [embed]});

      }

  }

}

const shorten = (text, size) => {
  if (typeof text !== "string") return "";
  if (text.length <= size) return text;
  return text.substr(0, size).trim() + "...";
};
  
const convertMilliseconds = (ms) => {
  const seconds = ~~(ms / 1000);
  const minutes = ~~(seconds / 60);
  const hours = ~~(minutes / 60);
  return { hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60}
};
  
const formatTime = (time, format, twoDigits = true) => {  
  const formats = {
    dd: "days",
    hh: "hours",
    mm: "minutes",
    ss: "seconds"
  }  
  return format.replace(/dd|hh|mm|ss/g, (match) => time[formats[match]].toString().padStart(twoDigits ? 2 : 0, "0"));
};