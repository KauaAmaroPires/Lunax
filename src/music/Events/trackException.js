module.exports = async (client, player, track, err) => {

  if (err && (err.message.includes('429') || err.message.includes('This video is not available'))) {
    const newNode = client.music.nodes.find(node => node.state === 1 && node !== player.node);

    if (newNode) {
      player.moveNode(newNode);
      return;
    }
  }
  if (player.textChannelId) {
    const channel = client.channels.cache.get(player.textChannelId);
    channel.send({ content: `Ocorreu um erro ao tocar a música ${track.title}. Erro: \`${err.message}\`` });
  };

  if (err.message.includes('Failed to resolve track')) {
    if (player.queue.size > 0) {
      player.skip();
    }
    else {
      if (player.queue) {
        if (player.queue.tracks[0]) player.queue.clear();
      };
      if (player.queueRepeat) player.setQueueLoop(false);
      if (player.trackRepeat) player.setTrackLoop(false);
      player.destroy();
    }
    return;
  }

  if (player.errorCount === undefined) {
    player.errorCount = 0;
  } else player.errorCount += 1;

  if (player.errorCount === 3) {
    const newNode = client.music.nodes.find(node => node.state === 1 && node !== player.node);

    if (newNode) {
      player.moveNode(newNode);
      return;
    }
  } else if (player.errorCount >= 10) {
    if (player.queue) {
      if (player.queue.tracks[0]) player.queue.clear();
    };
    if (player.queueRepeat) player.setQueueLoop(false);
    if (player.trackRepeat) player.setTrackLoop(false);
    player.destroy();
    return;
  }

  if (player.queue.size > 0) {
    player.skip();
  }
  else {
    if (player.queue) {
      if (player.queue.tracks[0]) player.queue.clear();
    };
    if (player.queueRepeat) player.setQueueLoop(false);
    if (player.trackRepeat) player.setTrackLoop(false);
    player.destroy();
  }

};