const Event = require('../../structures/Event');
const Discord = require('discord.js');

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: 'messageCreate'
        })
    }

    run = async (msg) => {

        if (!msg.guild) return;

        if(msg.author.bot || !msg.guild) return;

        if(msg.content === `<@${this.client.user.id}>` || msg.content === `<@!${this.client.user.id}>`) {
            msg.reply({ content: `Meu nome e ${this.client.user.username}, sou um bot de musica... Use os meus comandos em slash /`}).catch(err => {});
        };

        const prefix = this.client.config.PREFIX;

        if (
            msg.content.startsWith(prefix) ||
            msg.content.startsWith(`<@${this.client.user.id}>`) ||
            msg.content.startsWith(`<@!${this.client.user.id}>`) ||
            msg.content.toLowerCase().startsWith(`${this.client.user.username.toLowerCase()}`)
        ) {

            if (!msg.guild.members.me.permissionsIn(msg.channel).has(Discord.PermissionFlagsBits.SendMessages)) return msg.author.send({content: 'Para eu enviar mensagens no servidor eu preciso ter pelo menos a permissão de `enviar mensagens`.'}).catch(e => {});

            if (!msg.member) msg.member = msg.guild.fetchMember(msg);

            let prefixLength;

            if (msg.content.startsWith(prefix)) prefixLength = prefix.length;
            if (msg.content.startsWith(`<@${this.client.user.id}>`)) prefixLength = `<@${this.client.user.id}>`.length;
            if (msg.content.startsWith(`<@!${this.client.user.id}>`)) prefixLength = `<@!${this.client.user.id}>`.length;
            if (msg.content.toLowerCase().startsWith(`${this.client.user.username.toLowerCase()}`)) prefixLength = `${this.client.user.username}`.length;

            const args = msg.content.slice(prefixLength).trim().split(/ +/g);

            const cmd = args.shift().toLowerCase();

            if (cmd.length == 0) return;

            let command = this.client.commands.get(cmd);

            if (!command) command = this.client.commands.get(this.client.aliases.get(cmd));

            if (!command) return;

            if (command) {
                await command.run({ client: this.client, msg: msg, args: args }).catch(e => {
                    console.log(e);
                });
            };

        };
    }
}