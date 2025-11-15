const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = {
    name: "slashreload",
    aliases: ["slashr"],

    run: async ({ client: client, msg: msg, args: args }) => {

        if (!client.config.DEVELOPERS.includes(msg.member.id)) return;

        if (!args[0]) return msg.reply({content: 'ERRO: sem categoria.'});
        if (!args[1]) return msg.reply({content: 'ERRO: sem comando.'});

        let cate = args[0];
        let command = args[1];

        try {

            delete require.cache[require.resolve(`../../SlashCommands/${cate}/${command}.js`)];

        } catch (e) {
            return msg.reply({content: 'ERRO: seila po kkkk.'})
        }

        client.commandsslash = [];

        const path = 'src/SlashCommands';

        const categories = readdirSync(path)

        for (const category of categories) {
            const commandsslash = readdirSync(`${path}/${category}`)

            for (const command of commandsslash) {
            const commandClass = require(join(process.cwd(), `${path}/${category}/${command}`))
            const cmd = new (commandClass)(client)

            if (cmd.type === ApplicationCommandOptionType.Subcommand) {

                const command = client.commandsslash.filter(i => i.name === category);

                if (command[0]) {
                client.commandsslash.filter(i => i.name === category)[0].options.push({
                    name: cmd.name,
                    description: cmd.description,
                    type: cmd.type,
                    options: cmd.options
                });
                }
                else {

                const sub = {
                    name: cmd.name,
                    description: cmd.description,
                    type: cmd.type,
                    options: cmd.options
                };

                cmd.name = category;
                cmd.description = `Comandos de ${category.toLowerCase()}.`;
                cmd.options = [sub];
                cmd.type = ApplicationCommandType.ChatInput;
                cmd.run = false;

                client.commandsslash.push(cmd);

                }

            }

            else if (cmd.type === ApplicationCommandOptionType.SubcommandGroup) {

                const command = client.commandsslash.find(i => i.name === category);

                if (command) {

                const group = command.options.find(i => i.name === cmd.name);

                if (group) {
                    const groupSub = cmd.options[0];
                    groupSub.description = groupSub.description || `Comandos de ${category.toLowerCase()}.`;
                    client.commandsslash.find(i => i.name === category).options.find(i => i.name === cmd.name).options.push(groupSub);
                } else {
                    client.commandsslash.find(i => i.name === category).options.push({
                    name: cmd.name,
                    description: cmd.description || `Comandos de ${category.toLowerCase()}.`,
                    type: cmd.type,
                    options: cmd.options
                    });
                }
                }
                else {

                const group = {
                    name: cmd.name,
                    description: cmd.description || `Comandos de ${category.toLowerCase()}.`,
                    type: cmd.type,
                    options: cmd.options
                };

                cmd.name = category;
                cmd.description = `Comandos de ${category.toLowerCase()}.`;
                cmd.options = [group];
                cmd.type = ApplicationCommandType.ChatInput;
                cmd.run = false;

                client.commandsslash.push(cmd);

                }

            }

            else {
                client.commandsslash.push(cmd);
            }
            }
        }

        return msg.reply({content: `Comando \`${command}\` recarregado.`});

    }
}
