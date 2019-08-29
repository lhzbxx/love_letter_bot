import telegraf, { Extra, Markup, ContextMessageUpdate } from 'telegraf';
import httpsProxyAgent from 'https-proxy-agent';
import { GameManager } from '../db/game-manager';
import { token } from '../config.json';

const gm = new GameManager();

const bot = new telegraf(token, {
  // todo: 根据 process.env.environment 判断是否需要代理。
  telegram: { agent: new httpsProxyAgent('http://127.0.0.1:1087') },
});

const rulebook = Markup.inlineKeyboard([
  Markup.callbackButton('📜 规则书', 'rulebook'),
]);
const rulebook1 = Markup.inlineKeyboard([
  [
    Markup.callbackButton('◀️ 结算', 'rulebook-finish'),
    Markup.callbackButton('卡牌 ▶️', 'rulebook-card'),
  ],
  [Markup.callbackButton('↩️', 'navigate-back')],
]);

bot.on('callback_query', ({ callbackQuery: { data }, editMessageText }) => {
  switch (data) {
    case 'rulebook': {
      editMessageText('这，就是规则书。', { reply_markup: rulebook1 });
      break;
    }
  }
});

const welcomeHandler = ({ replyWithMarkdown }) => {
  replyWithMarkdown(welcome, {
    reply_markup: rulebook,
    disable_web_page_preview: true,
  });
};

/**
 * 游戏流程。
 */
bot.start(({ from, chat, replyWithMarkdown }) => {
  if (chat.type === 'group') {
    // 如果在群组里，则创建游戏、显示当前的游戏信息和选项。
    const game = gm.start(from, chat.id);
  } else {
    // 如果不在群组里，则发送「帮助」信息。
    replyWithMarkdown(welcome, {
      reply_markup: rulebook,
      disable_web_page_preview: true,
    });
  }
});
bot.help(({ replyWithMarkdown }) => {
  replyWithMarkdown(welcome, {
    reply_markup: rulebook,
    disable_web_page_preview: true,
  });
});
bot.command('ref', ({ chat: { id }, replyWithPhoto }) => {
  const game = gm.find(id);
  // 根据游戏人数发送对应的提示。
  if (game && game.numPlayer > 4) {
    replyWithPhoto('');
  } else {
    replyWithPhoto(
      'AgADBQADyqgxGxrpmFck780Kp7V_yVKBAjMABAEAAwIAA3gAA5KqAQABFgQ',
    );
  }
});

bot.on('message', ({ message }) => {
  console.log(message);
});

/**
 * 帮助。
 */
const welcome = `🛎️ 把 bot [添加到群组](t.me/BG_LoveLetterBot?startgroup=null)，在群组里开始游戏。

桌面游戏《情书》是一款 2-5 分钟的休闲游戏（2-8 玩家），由 Seiji Kanai 设计，以「手牌管理」和「淘汰玩家」为核心，发行于 2012 年，在 BGG 总体排名 200+。

✏️ 在 2-4 人的游戏中，共有 8 种角色（牌），每张牌都有一个效果。在游戏中随时发送 /ref，查看所有卡牌的数目和效果。
`;

export default bot;
