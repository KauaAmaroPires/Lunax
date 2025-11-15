const { Client, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
const ascii = require('ascii-table')

module.exports = class extends Client {
  constructor (options) {
    super(options)

    this.commandsslash = []
    this.loadSlashCommands()
    this.loadEvents()

  }

  registryCommands() {
    this.application.commands.set(this.commandsslash);
  }

  loadSlashCommands(path = 'src/SlashCommands') {

    let table = new ascii("Slash");
    table.setHeading('Comandos', 'Status Comando');

    const categories = readdirSync(path);

    for (const category of categories) {
      const commandsslash = readdirSync(`${path}/${category}`);

      for (const command of commandsslash) {
        const commandClass = require(join(process.cwd(), `${path}/${category}/${command}`));
        const cmd = new (commandClass)(this);

        table.addRow(command,' Carregado')

        if (cmd.type === ApplicationCommandOptionType.Subcommand) {

          const command = this.commandsslash.find(i => i.name === category);

          if (command) {
            this.commandsslash.find(i => i.name === category).options.push({
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

            this.commandsslash.push(cmd);

          }

        }

        else if (cmd.type === ApplicationCommandOptionType.SubcommandGroup) {

          const command = this.commandsslash.find(i => i.name === category);

          if (command) {

            const group = command.options.find(i => i.name === cmd.name);

            if (group) {
              const groupSub = cmd.options[0];
              groupSub.description = groupSub.description || `Comandos de ${category.toLowerCase()}.`;
              this.commandsslash.find(i => i.name === category).options.find(i => i.name === cmd.name).options.push(groupSub);
            } else {
              this.commandsslash.find(i => i.name === category).options.push({
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

            this.commandsslash.push(cmd);

          }

        }

        else {
          this.commandsslash.push(cmd);
        }
      };
    };

    console.log(table.toString());
    
  }

  loadCommands({ path: path, client: client }) {

    let table = new ascii("Commands");
    table.setHeading('Comandos', 'Status Comando');

    readdirSync(path).forEach(dir => {
      const commands = readdirSync(`${path}/${dir}/`).filter(file => file.endsWith('.js'));
      for(let file of commands){
        let pull = require(`../Commands/${dir}/${file}`);
        if(pull.name){
            client.commands.set(pull.name, pull);
            table.addRow(file,' Carregado')
        } else {
            table.addRow(file, ' Erro')
            continue;
        }if(pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name))
      }
    });
    console.log(table.toString());
  }

  loadEvents(path = 'src/Events') {
    const categories = readdirSync(path)

    for (const category of categories) {
      const events = readdirSync(`${path}/${category}`)

      for (const event of events) {
        const eventClass = require(join(process.cwd(), `${path}/${category}/${event}`))
        const evt = new (eventClass)(this)

        this.on(evt.name, evt.run)
      }
    }
  }
}