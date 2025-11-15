const Discord = require('discord.js');

module.exports = async (client, player, track) => {
  if (player.textChannelId) {
    const channel = client.channels.cache.get(player.textChannelId);
    channel.send({ content: `Ocorreu um erro ao tocar a música ${track.title}.` });
    player.skip();
  }
}
