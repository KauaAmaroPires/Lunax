const Command = require('../../structures/Slash.js');
const Discord = require("discord.js");
const TrackQueue = require('../../structures/TrackQueue.js');
const Queue = new TrackQueue();
const { ConnectionState } = require('vulkava');
const radio = require('../../util/radio.js');

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: 'radio',
      description: 'Começa a tocar uma rádio',
      options: [
        {
            name: 'radio',
            description: 'pesquisar rádio que você quer usar',
            type: Discord.ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Lofi',
                    value: 'lofi'
                },
                {
                    name: 'Sertanejo',
                    value: 'sertanejo'
                },
                {
                    name: 'Pagode',
                    value: 'pagode'
                },
                {
                    name: 'POP',
                    value: 'pop'
                },
                {
                    name: 'HitsBrasil',
                    value: 'hitsbrasil'
                },
                {
                    name: 'Gospel',
                    value: 'gospel'
                },
                {
                    name: 'Rock',
                    value: 'rock'
                },
                {
                    name: 'ModaSertaneja',
                    value: 'modasertaneja'
                },
                {
                    name: 'Pisadinha',
                    value: 'pisadinha'
                },
                {
                    name: 'POP2k',
                    value: 'pop2k'
                },
                {
                    name: 'Tropical',
                    value: 'tropical'
                },
                {
                    name: '80s',
                    value: '80s'
                }
            ],
            required: true
        }
      ]
    })
  }

    run = async ({ client: client, msg: msg }) => {

        if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.EmbedLinks)) return msg.editReply({content: 'Eu preciso da permissão `EMBED_LINKS`.'});

        const player2 = client.music.players.get(msg.guild.id);

        try {

            if (player2) {
                if (msg.member.voice.channelId != msg.guild.members.me.voice.channelId) return msg.editReply({ content: `${client.config.emoji.erro} **|** ${msg.user}, você deve estar no mesmo canal de voz que eu.`, ephemeral: true });
            }

            if (!msg.member.voice.channel) return msg.editReply({ content: `${client.config.emoji.erro} **|** ${msg.user}, você precisa se conectar a um canal de voz.`, ephemral: true });

            if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Connect)) return msg.editReply({content: 'Eu preciso da permissão de `conectar` e `falar`.'});

            if (!msg.guild.members.me.permissionsIn(msg.member.voice.channel).has(Discord.PermissionFlagsBits.Speak)) return msg.editReply({content: 'Eu preciso da permissão `conectar` e `falar`.'});

            const res = radio[msg.options.getString('radio')];

            const result = await client.music.search(res.url);

            if (result.loadType === "LOAD_FAILED") return msg.editReply({content: 'Não consegui tocar a rádio.'});
            if (result.loadType === "NO_MATCHES") return msg.editReply({content: 'Não encontrei a rádio.'});

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

            const player = player2 || createPlayer();

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

                player.connect();

            }

            if (result.loadType === "TRACK_LOADED") {

                let skip = false;

                const track = result.tracks[0];
                track.setRequester(msg.user);
                track.title = msg.options.getString('radio');
                track.radio = true;

                player.radio = true;

                if (player.autoplay?.status) {
                    player.autoplay.status = false;
                    player.autoplay.track = null;
                };

                if (player.queueRepeat) {
                    player.setQueueLoop(false);
                };

                if (player.trackRepeat) {
                    player.setTrackLoop(false);
                };

                if (player.queue.tracks[0]) {
                    skip = true;
                    player.queue.addToBeginning(track);
                } else if (player.current) {
                    skip = true;
                    player.queue.add(track);
                } else {
                    player.queue.add(track);
                }

                if (!player.playing) player.play();
                if (skip) player.skip();

                const embed = new Discord.EmbedBuilder()
                    .setTitle('Rádio adicionada.')
                    .setColor('Green');

                msg.editReply({embeds: [embed]});

            }

        } catch(err) {
            if (err) console.log(err);
            return msg.editReply({content: 'Ocorreu um erro, tente novamente.'})
        }

    }

}