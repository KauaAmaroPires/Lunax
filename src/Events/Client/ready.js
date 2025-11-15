const Event = require('../../structures/Event');
const Manager = require('../../music/Manager.js');
const { connectLavaLink } = new Manager;
const { slashCount } = require("../../functions/countSlash.js");
const { readdirSync } = require('fs');
const { Collection, ActivityType } = require('discord.js');
const figlet = require('figlet');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'ready'
    })
  }

  run = async () => {

    this.client.commands = new Collection()
    this.client.aliases = new Collection()
    this.client.categories = readdirSync("src/Commands")

    this.client.registryCommands();
    this.client.loadCommands({ path: 'src/Commands', client: this.client });
    connectLavaLink(this.client);
    
    console.log(`
  ===========================================================================
  Bot iniciado
  Nome: ${this.client.user.tag}
  Slashs: ${slashCount}
  Comandos: ${this.client.commands.size}
  Canais: ${this.client.channels.cache.size}
  Usuários: ${this.client.guilds.cache.map((x) => x.memberCount).reduce((x, f) => x + f)}
  Servidores: ${this.client.guilds.cache.size}
  Memória RAM: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB
  CPU: ${(process.cpuUsage().system / 1024 / 1024).toFixed(2)}% de CPU
  ===========================================================================`);
  console.log(figlet.textSync('  LUNAX'));
  console.log('  ===========================================================================');

    //----

    //STATUS DO BOT


    function setStatus(client) {

      var tabela = [
        { name: '/play', type: ActivityType.Listening, url: 'https://www.twitch.tv/kalzin_tv' }
      ];
      
      var altstatus = tabela[Math.floor(Math.random() * tabela.length)];

      client.user.setActivity(altstatus.name, {
        type: altstatus.type,
        url: altstatus.url
      });

    };

    setStatus(this.client);

    setInterval(() => setStatus(this.client), 60000);

    /*setInterval(async function avatar() {

        var avts = require('../image/avatar.json').avatar;

        await this.client.user.setAvatar(avts[Math.floor(Math.random() * avts.length)]);

    }, 600000);*/

    this.client.music.start(this.client.user.id);

  }
}
