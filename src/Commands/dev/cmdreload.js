const Discord = require('discord.js');

module.exports = {
    name: "cmdreload",
    aliases: ["cmdr"],

    run: async ({ client: client, msg: msg, args: args }) => {

        if (!client.config.DEVELOPERS.includes(msg.member.id)) return;

        if (!args[0]) return msg.reply({content: 'ERRO: sem categoria.'});
        if (!args[1]) return msg.reply({content: 'ERRO: sem comando.'});

        let cate = args[0];
        let command = args[1];

        try {

            delete require.cache[require.resolve(`../${cate}/${command}.js`)];
            client.commands.delete(command);

            const pull = require(`../${cate}/${command}.js`);
            client.commands.set(command, pull);

            return msg.reply({content: `Comando \`${command}\` recarregado.`});

        } catch (e) {
            return msg.reply({content: 'ERRO: seila po kkkk.'})
        }

    }
}