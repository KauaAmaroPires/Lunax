const Discord = require('discord.js');

module.exports = async (client, player) => {

  if (player.autoplay?.status) {

    const URL = `https://www.youtube.com/watch?v=${player.autoplay.track.identifier}&list=RD${player.autoplay.track.identifier}`;
    const res = await client.music.search(URL);

    if (!res.tracks.length) return player.destroy();

    const tracks = res.tracks.map((track) => track.title !== player.autoplay.track.title ? track : '').filter((f) => f);
    const track = tracks[Math.floor(Math.random() * tracks.length)];

    track.setRequester(player.autoplay.req)
    player.queue.add(track);
    player.play().catch(() => {});

  } else {

    const pl = client.music.players.get(player.guildId);

    const embed = new Discord.EmbedBuilder()
      .setColor('Red')
      .setDescription('A fila acabou, estou desconectando.');

    client.channels.cache.get(player.textChannelId).send({embeds: [embed]});

    pl.destroy();

  }

}
