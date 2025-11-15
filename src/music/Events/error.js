module.exports = async (client, node, error) => {

  if (error && error.message.includes('"pong"')) {
    const lavalinkPing = client.LavaLinkPing.get(node.options.id)
    lavalinkPing.ping = Date.now() - lavalinkPing.lastPingSent;
    return;
  }

  console.log(`[LavaLink] - Erro ao conectar no Node ${node.options.id} | ERRO: ${error.message}`)

  if (error.message.startsWith("Unable to connect after"))
  client.music.reconnect()

}
