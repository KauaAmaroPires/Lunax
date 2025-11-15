const delay = require('util').promisify(setTimeout);
const Discord = require('discord.js');

module.exports = async (client, x) => {

  if (x.t === 'VOICE_STATE_UPDATE') {
    if (x.d.member.user.id === client.user.id) {

      await delay(1000);

      if (x.d.channel_id === "null" || x.d.channel_id === null) {

        const player = client.music.players.get(x.d.guild_id);

        if (player) {
          if (player.queue) {
            if (player.queue.tracks[0]) player.queue.clear();
          };
          if (player.queueRepeat) player.setQueueLoop(false);
          if (player.trackRepeat) player.setTrackLoop(false);
          player.destroy();
        };

      }

    }
  }

  client.music.handleVoiceUpdate(x);

}
