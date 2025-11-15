const { Options, GatewayIntentBits } = require("discord.js");
const Client = require('./structures/Client.js');
const config = require('../config.json');

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildScheduledEvents
    ],
    allowedMentions: {
      parse: ["users"]
    },
    makeCache: Options.cacheWithLimits({
      BaseGuildEmojiManager: 0,
      GuildBanManager: 0,
      GuildInviteManager: 0,
      GuildManager: Infinity,
      GuildStickerManager: 0,
      GuildScheduledEventManager: 0,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
    }),
    restTimeOffset: 0,
    restWsBridgetimeout: 100
});

client.config = config;

client.getUser = async (id, msg, req) => {

  const requir = req || false;

  let search = false;

  if (!msg === false || !msg === undefined) {

    let veri = true;

    const res = await msg.guild.members.search({ query: id, limit: 1 }).catch(e => veri = false);

    if (veri) search = await res.first()?.user;

    if (!veri) search = false;

  }

  if (search) return search;

  if (!search) {

    let membro;

    membro = await client.users.fetch(id, { force: true }).catch(e => {

      if (requir === false) return membro = false;

      if (requir === true) return membro = msg.author;

    });

    return membro;

  }

};

client.getMember = async (id, author, msg, req) => {

  const requir = req || false;

  let search = false;

  if (!msg === false || !msg === undefined) {

    let veri = true;

    const res = await msg.guild.members.search({ query: id, limit: 1 }).catch(e => veri = false);

    if (veri) search = await res.first();

    if (!veri) search = false;

  }

  if (search) return search;

  if (!search) {

    let membro;

    if (id === '' || id === null || id === false || id === undefined) {

      if (requir === false) return membro = false;

      if (requir === true) return membro = author;

    }

    membro = await msg.guild.members.fetch(id, { force: true }).catch(e => {

      if (requir === false) return membro = false;

      if (requir === true) return membro = author;

    });

    return membro;

  }

};

client.getChannel = async ({ msg: msg, channel: channel, req: req }) => {

  const requir = req || false;

  let ch;

  if (channel === '' || channel === null || channel === false || channel === undefined) {

    if (requir === false) return ch = false;

    if (requir === true) return ch = msg.channel;

  }

  ch = await msg.guild.channels.fetch(channel, { force: true }).catch(e => {

    if (requir === false) return ch = false;

    if (requir === true) return ch = msg.channel;

  });

  return ch;

};

client.getAttachment = async ({ msg: msg, user: user, slash: slash }) => {

  // 1 => Mencione alguém ou anexe uma mídia.
  // 2 => Só e permitido arquivos de até 5MB.
  // 3 => Formato de mídia não permitido.

  let ANEXO;
  let USER = user;
  let SLASH = slash || false;

  if (SLASH) {

    await msg.channel.messages.fetch().then((messages) => {
      const lastMessage = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => m.attachments.size > 0).first();
      if (!lastMessage) ANEXO = false;
      if (lastMessage) ANEXO = lastMessage.attachments.first();
    });

    const getAtta = msg.options.getAttachment('anexo');

    if (!USER && !getAtta && !ANEXO) return 1;

    if (!USER && !getAtta && ANEXO) {
      const size = (ANEXO.size / 1e+6);
      if (size > 5) return 2;
      if (ANEXO.contentType.includes('image/gif')) return 3;
      if (!ANEXO.contentType.includes('image')) return 3;
      return ANEXO.proxyURL;
    };

    if (USER && !getAtta) return USER.displayAvatarURL({ extension: 'png', size: 1024 });

    if (USER && getAtta) {
      const size = (getAtta.size / 1e+6);
      if (size > 5) return 2;
      if (getAtta.contentType.includes('image/gif')) return 3;
      if (!getAtta.contentType.includes('image')) return 3;
      return getAtta.proxyURL;
    };

    if (!USER && getAtta) {
      const size = (getAtta.size / 1e+6);
      if (size > 5) return 2;
      if (getAtta.contentType.includes('image/gif')) return 3;
      if (!getAtta.contentType.includes('image')) return 3;
      return getAtta.proxyURL;
    };

  }

  else {

    await msg.channel.messages.fetch().then((messages) => {
      const lastMessage = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => m.attachments.size > 0).first();
      if (!lastMessage) ANEXO = false;
      if (lastMessage) ANEXO = lastMessage.attachments.first();
    });

    if (!USER && msg.attachments.size === 0 && !ANEXO) return 1;

    if (!USER && !msg.attachments.first() && ANEXO) {
      const size = (ANEXO.size / 1e+6);
      if (size > 5) return 2;
      if (ANEXO.contentType.includes('image/gif')) return 3;
      if (!ANEXO.contentType.includes('image')) return 3;
      return ANEXO.proxyURL;
    };

    if (USER && !msg.attachments.first()) return USER.displayAvatarURL({ extension: 'png', size: 1024 });

    if (USER && msg.attachments.first()) {
      const size = (msg.attachments.first().size / 1e+6);
      if (size > 5) return 2;
      if (msg.attachments.first().contentType.includes('image/gif')) return 3;
      if (!msg.attachments.first().contentType.includes('image')) return 3;
      return msg.attachments.first().proxyURL;
    };

    if (!USER && msg.attachments.first()) {
      const size = (msg.attachments.first().size / 1e+6);
      if (size > 5) return 2;
      if (msg.attachments.first().contentType.includes('image/gif')) return 3;
      if (!msg.attachments.first().contentType.includes('image')) return 3;
      return msg.attachments.first().proxyURL;
    };

  };

};

client.login(client.config.TOKEN_DISCORD);

process.on("multipleResolves", (type, promise, reason) => {
  //console.log(`Vários erros identificados:\n\n` + type, promise, reason);
});

process.on("unhandRejection", (reason, promise) => {
  //console.log(`Erros identificado:\n\n` + reason, promise);
});

process.on("uncaughtException", (error, origin) => {
  if (!error.message.includes('handled with .catch(). The promise rejected with the reason')) {
    console.log(`Erros identificado:\n\n` + error, origin);
  };
});

process.on("uncaughtExceptionMonitor", (error, origin) => {
  if (!error.message.includes('handled with .catch(). The promise rejected with the reason')) {
    console.log(`Erros identificado:\n\n` + error, origin);
  };
});