const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");
const map = new Map();
const delay = require('util').promisify(setTimeout);

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      description: 'Pula uma música.'
    })
  }

  run = async ({ client: client, msg: msg }) => {

    const player = client.music.players.get(msg.guild.id);

    if (!player || !player.current) return msg.editReply({content: `Não estou tocando música.`});

    if (!msg.member.voice.channel || msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({content: 'Você não está conectado na mesma call que eu, ou não está em uma call.'});

    if (msg.member.voice.selfDeaf) return msg.editReply({content: 'Você está com o fone desligado, ligue para escutar as músicas.'});

    if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Connect)) return msg.editReply({content: 'Eu preciso da permissão de `conectar` e `falar`.'});

    if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Speak)) return msg.editReply({content: 'Eu preciso da permissão `conectar` e `falar`.'});

    const requireVotes = msg.guild.members.me.voice.channel.members.filter((x) => !x.user.bot && !x.voice.selfDeaf).size - 1;

    if (!map.get(`${msg.guild.id}_${msg.member.voice.channelId}`)) {

        map.set(`${msg.guild.id}_${msg.member.voice.channelId}`, []);

    }

    const list = map.get(`${msg.guild.id}_${msg.member.voice.channelId}`);

    if (list.some((x) => x === msg.user.id)) return msg.editReply({content: 'Você não pode votar 2 vezes.'});

    list.push(msg.user.id);

    map.set(`${msg.guild.id}_${msg.member.voice.channelId}`, list);

    const lista = map.get(`${msg.guild.id}_${msg.member.voice.channelId}`);

    if (lista.length >= requireVotes) {

        player.skip();

        if (player.radio) {
          player.radio = false;
          player.skip();
        };

        const embed = new Discord.EmbedBuilder()
            .setDescription(`Música \`${player.current.title}\` skipada.`)
            .setColor('Green')

        msg.editReply({embeds: [embed]});

        map.delete(`${msg.guild.id}_${msg.member.voice.channelId}`);

        return;

    }

    msg.editReply({content: `Vote para skipar a música. **[${lista.length}/${requireVotes}]**, caso os votos não serem feitos em **1 minuto**, apagarei os votos.`});

    await delay(60000);

    if (map.get(`${msg.guild.id}_${msg.member.voice.channelId}`)) {
        map.delete(`${msg.guild.id}_${msg.member.voice.channelId}`);
        return;
    }

  }

}