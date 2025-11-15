const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");
const { request } = require('undici');
const lyrics = require('../../functions/lyrics_musixmatch.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'lyrics',
      description: 'Pega a letra de uma música.',
      options: [
        {
            name: 'search',
            description: 'Pesquise a música que deseja pegar a letra.',
            type: Discord.ApplicationCommandOptionType.String,
            required: false,
        }
      ]
    })
  }

  run = async ({ client: client, msg: msg }) => {

    const player = client.music.players.get(msg.guild.id);

    let music = msg.options.getString('search');

    if (!music) {
        if (!player || !player.current) {
            msg.editReply({content: 'Coloque algo pra pesquisar.'});
            return;
        } else {
            music = player.current.title;
        }
    }

    function substring(length, value) {

        const replaced = value.replace(/\n/g, '--');
        const regex = `.{1,${length}}`;
        const lines = replaced.match(new RegExp(regex, 'g')).map(line => line.replace(/--/g, '\n'));

        return lines;

    };

    try {

      let res = await lyrics({ client: client, title: music });

      if (res.error) {
        res = await request(`https://some-random-api.ml/lyrics?title=${encodeURIComponent(music)}`).then(e => e.body.json()).catch(e => {});

        if (!res || !res || res.error) {
          throw new Error("Não achei a letra da música, tente novamente.");
        };

        res = {
          title: res.title,
          author: res.author,
          image: res.thumbnail.genius,
          lyrics: res.lyrics
        };

      };

      const embeds = substring(4096, res.lyrics).map((value, index) => {
          const isFirst = index === 0;

          return new Discord.EmbedBuilder({
              title: isFirst ? `${res.title} - ${res.author}`: null,
              thumbnail: isFirst ? { url: res.image } : null,
              description: value,
              color: 2829617
          });
      });

      return msg.editReply({ embeds }).catch(e => msg.editReply({content: 'Não achei a letra da música.'}));

    } catch (e) {
      msg.editReply({content: `ERR: ${e.message}`});
    }

  }

}