const delay = require('util').promisify(setTimeout);
const { ChannelType } = require('discord.js');
const { ConnectionState } = require('vulkava');

module.exports = async (client, oldState, newState) => {

  const channel = newState.guild.channels.cache.get(newState.channel?.id ?? newState.channelId);

  const player = client.music.players.get(newState.guild.id);

  if (!player || player.state !== ConnectionState.CONNECTED) return;

  const stateChange = {};

  if (oldState.channel === null && newState.channel !== null) stateChange.type = "JOIN";
  if (oldState.channel !== null && newState.channel === null) stateChange.type = "LEAVE";
  if (oldState.channel !== null && newState.channel !== null) stateChange.type = "MOVE";
  if (oldState.channel === null && newState.channel === null) return;
  if (newState.serverMute == true && oldState.serverMute == false) return player.pause(true);
  if (newState.serverMute == false && oldState.serverMute == true) return player.pause(false);

  if (stateChange.type === "MOVE") {

    if (oldState.channel.id === player.voiceChannelId) stateChange.type = "LEAVE";
    if (newState.channel.id === player.voiceChannelId) stateChange.type = "JOIN";

  }

  if (stateChange.type === "JOIN") stateChange.channel = newState.channel;
  if (stateChange.type === "LEAVE") {
    stateChange.channel = oldState.channel;
  }

  if (!stateChange.channel || stateChange.channel.id !== player.voiceChannelId) return;

  stateChange.members = stateChange.channel.members.filter((m) => !m.user.bot);

  switch (stateChange.type) {
    case "JOIN": {
      if (stateChange.members.size === 1 && player.paused) {

        player.pause(false);

      }
      break;
    }

    case "LEAVE": {
      if (stateChange.members.size === 0 && !player.paused && player.playing) {
        player.pause(true);
      }
      break;
    }

  }

  if (!newState.guild.members.cache.get(client.user.id).voice.channelId) {
    if (player.queue) {
      if (player.queue.tracks[0]) player.queue.clear();
    };
    if (player.queueRepeat) player.setQueueLoop(false);
    if (player.trackRepeat) player.setTrackLoop(false);
    player.destroy();
    return;
  };

  if (newState.id == client.user.id && channel?.type == ChannelType.GuildStageVoice) {

    if (!oldState.channelId) {

      try {
        await newState.guild.members.me.voice.setSuppressed(false);
      } catch (err) {
        newState.guild.members.me.voice.setRequestToSpeak(true);
        await delay(10000);
        player.pause(true);
      }

    } else if (oldState.suppress !== newState.suppress) {
      await newState.guild.members.me.voice.setRequestToSpeak(newState.suppress);
      player.pause(newState.suppress);
    }

  }

  if (oldState.id === client.user.id) return;
  if (!oldState.guild.members.cache.get(client.user.id).voice.channelId) return;

  if (oldState.guild.members.cache.get(client.user.id).voice.channelId === oldState.channelId) {

    if (oldState.guild.members.me.voice?.channel && oldState.guild.members.me.voice.channel.members.filter((m) => !m.user.bot).size === 0) {

      await delay(180000);

      const vcMembers = oldState.guild.members.me.voice.channel?.members.filter((m) => !m.user.bot).size;

      if (!vcMembers) {

        if (player.queue) {
          if (player.queue.tracks[0]) player.queue.clear();
        };
        if (player.queueRepeat) player.setQueueLoop(false);
        if (player.trackRepeat) player.setTrackLoop(false);

        player.destroy();

      }

    }

    if (!oldState.guild.members.me.voice.channel) return;
    if (!oldState.guild.members.me.voice.channel.members) return;

    if (oldState.guild.members.me.voice.channel.members.filter((x) => !x.user.bot && !x.voice.selfDeaf && !x.voice.serverDeaf).size === 0) {

      player.pause(true);

      await delay(180000);

      if (!oldState.guild.members.me.voice.channel) return;
      if (!oldState.guild.members.me.voice.channel.members) return;

      const vcMembers = oldState.guild.members.me.voice.channel.members.filter((x) => !x.user.bot && !x.voice.selfDeaf && !x.voice.serverDeaf).size;

      if (vcMembers === 0) {

        if (player.queue) {
          if (player.queue.tracks[0]) player.queue.clear();
        };
        if (player.queueRepeat) player.setQueueLoop(false);
        if (player.trackRepeat) player.setTrackLoop(false);

        player.destroy();

      }

    }

    if (oldState.guild.members.me.voice.channel.members.filter((x) => !x.user.bot && !x.voice.selfDeaf && !x.voice.serverDeaf).size > 0) player.pause(false);

  }

}
