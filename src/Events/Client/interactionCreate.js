const Event = require('../../structures/Event');
const { ApplicationCommandType, PermissionFlagsBits, InteractionType } = require('discord.js');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'interactionCreate'
    })
  }

  run = async (interaction) => {

    if (interaction.type === InteractionType.ApplicationCommand) {

      const cmd = this.client.commandsslash.find(c => c.name === interaction.commandName);

      if (!interaction.guildId || !interaction.channelId) return interaction.reply('Os comandos slash não podem ser usados na minha DM.');

      if (!interaction.client.guilds.cache.get(interaction.guildId)) return interaction.reply(`Para usar meus slashs você deve me adicionar de maneira correta.\n\n https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&scope=applications.commands%20bot&permissions=8`);

      const membro = interaction.guild.members.cache.get(this.client.user.id);

      if (!interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.SendMessages)) return interaction.user.send({content: 'Para eu enviar mensagens no servidor eu preciso ter pelo menos a permissão de `enviar mensagens`.'}).catch(e => {return});

      if (cmd) {

        await interaction.deferReply();

        if (cmd.type === ApplicationCommandType.ChatInput) {
          const group = cmd.name;
          const subName = interaction.options.getSubcommand();

          const commandClass = require(`../../SlashCommands/${group}/${subName}.js`);

          const sub = new (commandClass)(this);

          await sub.run({ client: this.client, msg: interaction });
        }
        else {
          await cmd.run({ client: this.client, msg: interaction });
        }
      }

    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {

      if (!interaction.member) return;

      const cmd = this.client.commandsslash.find(c => c.name === interaction.commandName);

      if (!cmd) return;

      const ops = interaction.options;

      if (cmd.type === ApplicationCommandType.ChatInput) {
        const group = cmd.name;
        const subName = interaction.options.getSubcommand();

        const commandClass = require(`../../SlashCommands/${group}/${subName}.js`);

        const sub = new (commandClass)(this);

        await sub.runAutoComplete?.({ client: this.client, interaction: interaction, value: ops.getFocused(), option: ops });
      }
      else {
        await cmd.runAutoComplete?.({ client: this.client, interaction: interaction, value: ops.getFocused(), option: ops });
      };

      return;

    };

  }
}
