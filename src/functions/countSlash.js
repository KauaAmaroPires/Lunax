const fs = require('fs');

const pasta = 'src/SlashCommands'

const categories = fs.readdirSync(pasta);

const numc = [];

for (const category of categories) {
  const num = fs.readdirSync(`${pasta}/${category}`).length;
  numc.push(num);
};

module.exports = {
  slashCount: `${numc.reduce((acc, count) => acc + count, 0)}`
}
