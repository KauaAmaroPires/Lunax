const { Vulkava } = require('vulkava');
const { request } = require('undici');
const radios = require('../util/radio.js');

class Manager {
    constructor() {}

    connectLavaLink(client) {

        client.LavaLinkPing = new Map();
        client.channelTimeouts = new Map();

        client.music = new Vulkava({
            nodes: [
                {
                    id: 'USA Node',
                    hostname: client.config.HOST,
                    port: client.config.PORT,
                    password: client.config.PASSWORD,
                    maxRetryAttempts: 5,
                    retryAttemptsInterval: 6000,
                    secure: false,
                    region: 'USA',
                    resumeKey: 'Lunax'
                }
            ],
            sendWS(id, payload) {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
              },
              spotify: {
                clientId: client.config.clientSpotifyID,
                clientSecret: client.config.clientSpotifySecret
              }
        })

        .on('nodeConnect', (node) => {
            require('./Events/nodeConnect.js')(client, node);
        })

        .on("nodeResume", (node, error) => {
            require('./Events/nodeResume')(client, node, error);
        })

        .on("error", (node, error) => {
            require('./Events/error')(client, node, error);
        })

        .on("trackStart", async (player, track) => {
            require('./Events/trackStart')(client, player, track);
        })

        .on("trackStuck", async (player, track) => {
            require('./Events/trackStuck')(client, player, track);
        })

        .on('trackException', async (player, track, err) => {
            require('./Events/trackException')(client, player, track, err);
        })

        .on("queueEnd", async (player) => {
            require('./Events/queueEnd')(client, player);
        })

        client.on('raw', async (x) => {
            require('./Events/raw')(client, x);
        });

        client.on("voiceStateUpdate", async (oldState, newState) => {
            require('./Events/voiceStateUpdate')(client, oldState, newState);
        });

        client.music.getNowplayingRadio = async ({ name: name }) => {

            const res = await request(radios[name].nowplaying).then(e => e.body.json()).catch(e => {});

            if (!res) return {
                error: 'NOT DATA'
            };

            const data = res[0];
            const thumb = Object.keys(data.thumb)[Object.keys(data.thumb).length - 1];

            return {
                title: data.name,
                author: data.singers[0].name,
                thumb: data.thumb[thumb]
            };

        };

    }
};

module.exports = Manager;