const { Collection } = require("discord.js");
const { readdirSync } = require('fs');

module.exports = {
    name: "reloadcmd",
    aliases: ["rcmd"],

    run: async ({ client: client, msg: msg, args: args }) => {

        if (!client.config.DEVELOPERS.includes(msg.member.id)) return;

        client.commands = new Collection();

        readdirSync('src/Commands').forEach(dir => {
            const commands = readdirSync(`src/Commands/${dir}/`).filter(file => file.endsWith('.js'));
            for(let file of commands){
                delete require.cache[require.resolve(`../${dir}/${file}`)];
                let pull = require(`../${dir}/${file}`);
                if(pull.name){
                    client.commands.set(pull.name, pull);
                } else {
                    continue;
                }if(pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name))
            }
        });

        console.log('Comandos recarregados.');

        msg.reply({content: 'Comandos recarregados.'});

    }
}
