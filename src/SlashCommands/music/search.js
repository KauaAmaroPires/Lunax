const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { ConnectionState } = require('vulkava');
const TrackQueue = require('../../structures/TrackQueue.js');
const Queue = new TrackQueue();
const { request } = require('undici');
const soundCloudIdExtractor = require('../../structures/soundCloudIdExtractor.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'search',
      description: 'Pesquisa músicas relacionadas a o nome da música pesquisada.',
      options: [
        {
            name: 'source',
            description: 'Fonte pra qual vai ser a pesquisa.',
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'youtube',
                    value: 'youtube'
                },
                {
                    name: 'youtubemusic',
                    value: 'youtubemusic'
                },
                {
                    name: 'soundcloud',
                    value: 'soundcloud'
                },
                {
                    name: 'odysee',
                    value: 'odysee'
                }
            ],
            required: true
        },
        {
            name: 'search',
            description: 'Pesquise as músicas que deseja ouvir.',
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true

        }
      ]
    })
  }

  run = async ({ client: client, msg: msg }) => {

    if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.EmbedLinks)) return msg.editReply({content: 'Eu preciso da permissão `EMBED_LINKS`.'});

    let er = 'n';

    if (!msg.member.voice.channel) return msg.editReply({content: 'Você deve estar em uma call.'});

    const play = client.music.players.get(msg.guild.id);

    if (play) {
        if (msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({content: `${msg.user} Você deve estar no mesmo canal de voz que eu.`});
    }

    if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Connect)) return msg.editReply({content: 'Eu preciso da permissão de `conectar` e `falar`.'});

    if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Speak)) return msg.editReply({content: 'Eu preciso da permissão `conectar` e `falar`.'});

    const name = msg.options.getString('search');
    const source = msg.options.getString('source');

    if (!name) return msg.editReply({content: 'Coloque algo para pesquisar.'});

    const createPlayer = () => {
        const player = client.music.createPlayer({
            guildId: msg.guild.id,
            voiceChannelId: msg.member.voice.channel.id,
            textChannelId: msg.channel.id,
            selfDeaf: true,
            queue: Queue
        });
  
        player.effects = [];
        return player;
    };

    let player = client.music.players.get(msg.guild.id);

    let res;

    try {
        
        res = await client.music.search(name, source);

        if (res.loadType === "LOAD_FAILED") {

            if (!player || !player.current) {
                if (player.queue) {
                    if (player.queue.tracks[0]) player.queue.clear();
                };
                if (player.queueRepeat) player.setQueueLoop(false);
                if (player.trackRepeat) player.setTrackLoop(false);
                player.destroy();
            };

            throw new Error("erro de load")

        }

        switch (res.loadType) {
            case "NO_MATCHES": {

                if (!player || !player.current) {
                    if (player.queue) {
                        if (player.queue.tracks[0]) player.queue.clear();
                    };
                    if (player.queueRepeat) player.setQueueLoop(false);
                    if (player.trackRepeat) player.setTrackLoop(false);
                    player.destroy();
                };

                await msg.editReply({content: 'Sem resultado para essa pesquisa.'});

                break;

            }

            case "PLAYLIST_LODED": {

                await msg.editReply({content: 'Sem links.'});

                if (!player || !player.current) {
                    if (player.queue) {
                        if (player.queue.tracks[0]) player.queue.clear();
                    };
                    if (player.queueRepeat) player.setQueueLoop(false);
                    if (player.trackRepeat) player.setTrackLoop(false);
                    player.destroy();
                };

                break;

            }

            case "TRACK_LOADED": {

                await msg.editReply({content: 'Sem links.'});

                if (!player || !player.current) {
                    if (player.queue) {
                        if (player.queue.tracks[0]) player.queue.clear();
                    };
                    if (player.queueRepeat) player.setQueueLoop(false);
                    if (player.trackRepeat) player.setTrackLoop(false);
                    player.destroy();
                };

                break;

            }

            case "SEARCH_RESULT": {

                let max = 15;

                if (res.tracks.length < max) max = res.tracks.length;

                let options = res.tracks.slice(0, max).map(({ title, identifier, author, source }) => { return { title, identifier, author, source }});

                const row = new ActionRowBuilder();

                const Menu = new StringSelectMenuBuilder()
                    .setCustomId('musicSelector')
                    .setPlaceholder(`Selecione suas músicas aqui.`)
                    .setMinValues(1)
                    .setMaxValues(max);

                let i = 0;

                for (const track of options) {
                    i++;
                    if (track.source === 'soundcloud') track.identifier = track.identifier.split('//').join().split('/')[3];
                    Menu.addOptions(
                        [
                            {
                                label: `${i}° - ${track.title.slice(0, 55)}`,
                                description: `Canal: ${track.author.slice(0, 55)}`,
                                value: track.identifier
                            }
                        ]
                    );
                }

                const results = res.tracks.slice(0, max).map((track, index) => `**${++index}°** **[${
                    shorten(track.title, 55)
                    .split("[").join('')
                    .split("]").join('')
                    .split("(").join('')
                    .split(")").join('')
                }](${track.uri.split(' ').join('')})**`).join('\n');

                const embed = new Discord.EmbedBuilder()
                    .setColor('Random')
                    .setAuthor({name: '🔎 Músicas encontradas'})
                    .setTitle('<:YouTube:842084995715694622> Escolha seu vídeos de 1 a 15!')
                    .setDescription(results)
                    .setTimestamp(new Date)
                    .setFooter({text: `${msg.user.tag}`, iconURL: msg.user.displayAvatarURL()});

                row.addComponents([Menu]);

                msg.editReply({embeds: [embed], components: [row]}).then(message => {

                    const collector = message.createMessageComponentCollector({time: 60000, idle: 60000});

                    setTimeout(() => {
                        if (er === 'n') {
                            msg.editReply({content: 'Tempo pra escolher acabou.'})
                            message.delete().catch(O_o => {});
                            if (!player || !player.current) {
                                if (player.queue) {
                                    if (player.queue.tracks[0]) player.queue.clear();
                                };
                                if (player.queueRepeat) player.setQueueLoop(false);
                                if (player.trackRepeat) player.setTrackLoop(false);
                                player.destroy();
                            }
                        }
                        return
                    }, 62000);

                    collector.on("collect", async (interation) => {

                        if (interation.member.user.id !== msg.user.id) {

                            return interation.reply({content: 'Somente a pessoa que executou o comando pode escolher.', ephemeral: true})

                        }

                        switch (interation.customId) {
                            case 'musicSelector': {

                                er = 's';

                                let tracks = [];

                                player = player || createPlayer();

                                for (const id of interation.values) {
                                    let track = res.tracks;
                                    if (track[0].source === 'soundcloud') {
                                        track = res.tracks.find((x) => x.identifier.split('//').join().split('/')[3] === id);
                                        track.setRequester(msg.user);
                                        track.identifier = track.identifier.split('//').join().split('/')[3];
                                        player.queue.add(track);
                                        tracks.push(track);
                                    } else {
                                        track = res.tracks.find((x) => x.identifier === id);
                                        track.setRequester(msg.user);
                                        player.queue.add(track);
                                        tracks.push(track);
                                    }
                                };

                                if (player.state === ConnectionState.DISCONNECTED) {
                                    let voiceChannel = client.channels.cache.get(msg.member.voice.channel.id);
                                    if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.Administrator) && voiceChannel.userLimit && msg.member.voice.channel.members.size >= voiceChannel.userLimit) {
                                        msg.editReply({content: 'O canal de voz está cheio.'});
                                        if (player.queue) {
                                            if (player.queue.tracks[0]) player.queue.clear();
                                        };
                                        if (player.queueRepeat) player.setQueueLoop(false);
                                        if (player.trackRepeat) player.setTrackLoop(false);
                                        player.destroy();
                                        return;
                                    }
                                    await player.connect()
                                }

                                if (player.radio) {
                                    player.radio = false;
                                    player.skip();
                                };

                                if (!player.playing && !player.paused && player.queue.size === tracks.length) player.play();

                                if (msg.slash) player.setDescription('interation', msg)

                                await msg.channel.send({content: `Adicionei **${tracks.length}** músicas requisitadas por ${msg.user}`});

                                Menu.setDisabled(true);

                                collector.stop();

                                message.delete();

                                break;

                            }

                        }

                    })

                }).catch(e => {
                    msg.channel.send({content: 'Ocorreu um erro ao pesquisar essa música, tente novamente ou pesquise outra coisa.'});
                    return;
                })

                break;

            }

        }

    } catch (err) {
        msg.editReply({content: 'Ocorreu um erro ao pesquisar essa música, tente novamente ou pesquise outra coisa.'});
        //if (err) console.log(err.message);
    }

  }

  async runAutoComplete({ interaction: interaction, value: value, option: options }) {

    if (!value) {
      interaction.respond([]);
      return;
    };

    const choices = [];

    let Option = options._hoistedOptions.filter(x => x.name === 'source');

    if (!Option[0]) {
        interaction.respond([]);
        return;
    } else Option = Option[0];

    if (Option.value === 'youtube' || Option.value === 'youtubemusic') {

        const res = await request(`https://clients1.google.com/complete/search?client=youtube&hl=pt-PT&ds=yt&q=${encodeURIComponent(value)}`, {
            headers: {
                'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'
            }
        }).then(async e => Buffer.from(await e.body.arrayBuffer()).toString('utf8'));

        const data = res.split('[');

        for (var i = 3, min = Math.min(8 * 2, data.length); i < min; i+= 2) {
            const choice = data[i].split('"')[1].replace(/\\u([0-9a-fA-F]{4})/g, (_, cc) => String.fromCharCode(parseInt(cc, 16)));

            if (choice) {
                choices.push({
                    name: choice,
                    value: choice
                })
            }
        }

    } else if (Option.value === 'soundcloud') {

        const id = await soundCloudIdExtractor();

        if (id) {
            const res = await request(`https://api-v2.soundcloud.com/search/queries?q=${encodeURIComponent(value)}&client_id=${id}&limit=7`, {
                headers: {
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'
                }
            }).then(e => e.body.json());

            const searchResult = res.collection;

            for (var i = 0, min = Math.min(searchResult.length, 8); i < min; i++) {
                choices.push({
                    name: searchResult[i].output,
                    value: searchResult[i].output
                })
            }
        }

    } else if (Option.value === 'odysee') {

        if (value.length >= 3 && value.length < 99999) {
            const res = await request(`https://lighthouse.odysee.com/search?s=${encodeURIComponent(value)}&size=7&from=0&nsfw=false`, {
                headers: {
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36'
                }
            }).then(e => e.body.json());
    
            for (var i = 0, min = Math.min(res.length, 8); i < min; i++) {
                choices.push({
                    name: res[i].name,
                    value: res[i].name
                })
            }
        } else {
            return interaction.respond(choices);
        }

    }

    interaction.respond(choices);

  }

}

const shorten = (text, size) => {
    if (typeof text !== "string") return "";
    if (text.length <= size) return text;
    return text.substr(0, size).trim() + "...";
}
  
const convertMilliseconds = (ms) => {
    const seconds = ~~(ms / 1000);
    const minutes = ~~(seconds / 60);
    const hours = ~~(minutes / 60);
    return { hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60}
}

const formatTime = (time, format, twoDigits = true) => {
    const formats = {
        dd: "days",
        hh: "hours",
        mm: "minutes",
        ss: "seconds"
    }
    return format.replace(/dd|hh|mm|ss/g, (match) => time[formats[match]].toString().padStart(twoDigits ? 2 : 0, "0"));
}