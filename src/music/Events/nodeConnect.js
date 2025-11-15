module.exports = async (client, node) => {

  console.log(`[LavaLink] - ${node.options.id} conectado.`);

  client.LavaLinkPing.set(node.options.id, {});

  const sendPing = () => {
    node.send({
      op: "ping"
    })

    client.LavaLinkPing.get(node.options.id).lastPingSent = Date.now();
  }

  sendPing()
  setInterval(() => {
    sendPing()
  }, 45000);

  for (const player of client.music.players.values()) {
    if (player.node.options.id === node.options.id) {
      const position = player.position;
      player.connect();
      player.play({ startTime: position });
    };
  };

}
