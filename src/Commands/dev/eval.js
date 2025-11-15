const Discord = require('discord.js');
const { inspect } = require('util')

module.exports = {
    name: "eval",
    aliases: ["eval"],

    run: async ({ client: client, msg: msg, args: args }) => {

        if (!client.config.DEVELOPERS.includes(msg.member.id)) return;

        const command = args.join(" ");

        if (!command) return msg.reply({ content: `${client.config.emoji.erro} **|** ${msg.author}, informe o código para que eu possa executar.` });

        try {

          let palavrasres = ["token", "destroy"];

          if (palavrasres.some(word => msg.content.toLowerCase().includes(word))) {

            return msg.channel.send({content: 'Palavra retrita.'});

          }

          const out = eval(command);

          const embed = new Discord.EmbedBuilder()
            .setTitle('Eval')
            .setColor('Green')
            .addFields([
              {
                name: '**Tipo:**',
                value: `\`\`\`prolog\n${typeof(out)}\`\`\``,
                inline: true
              },
              {
                name: '**Tempo de eval:**',
                value: `\`\`\`yaml\n${Date.now() - msg.createdTimestamp}ms\`\`\``,
                inline: true
              },
              {
                name: '**Entrada:**',
                value: `\`\`\`js\n${command}\`\`\``
              },
              {
                name: '**Saída**',
                value: `\`\`\`js\n${inspect(out, {depth: 0})}\`\`\``
              }
            ]);

          if (inspect(out, {depth: 0}).length > 200) {

            msg.channel.send({files: [new Discord.AttachmentBuilder(Buffer.from(inspect(out, {depth: 0})), { name: 'log.txt' })]});
            return;

          } else {
            msg.channel.send({embeds: [embed]});
          }

        } catch (e) {

          const embed = new Discord.EmbedBuilder()
            .setTitle('Eval')
            .setColor('Red')
            .addFields([
              {
                name: '**Entrada:**',
                value: `\`\`\`js\n${command}\`\`\``
              },
              {
                name: '**Erro**',
                value: `\`\`\`js\n${e}\`\`\``
              }
            ]);

          msg.channel.send({embeds: [embed]})

        }
    }
}