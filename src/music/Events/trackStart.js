const Discord = require('discord.js');

module.exports = async (client, player, track) => {

  if (player.reconnect) {
    delete player.reconnect;
    return;
  };

  if (player.autoplay?.status) player.autoplay.track = track;

  const channel = client.channels.cache.get(player.textChannelId);

  if (player.lastPlayingMsgID) {
    const msg = channel.messages.cache.get(player.lastPlayingMsgID)

    if (msg) msg.delete().catch(e => {})
  }

  const embed = new Discord.EmbedBuilder()
    .setColor('Green')
    .setDescription(`Começando a tocar: **${track.title}**`);

  player.lastPlayingMsgID = await channel.send({embeds: [embed]}).then((x) => x.id);

}
