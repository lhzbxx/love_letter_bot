import { Middleware, ContextMessageUpdate } from 'telegraf';
import { bot } from './index';
import { gm } from '../mw/game-manager';
import { Menu } from './menu';
import { welcome, about } from './i18n';
import { rules } from './rule-book';

const mw: Middleware<ContextMessageUpdate> = (
  { callbackQuery, editMessageText },
  next,
) => {
  if (callbackQuery && callbackQuery.message) {
    next();
  } else {
    editMessageText(
      `<b>该消息已失效！</b>
发送 <code>/start</code> 开始游戏。`,
      Menu.none,
    ).catch(() => {});
  }
};

bot.action('welcome', ({ answerCbQuery, editMessageText }) => {
  answerCbQuery();
  editMessageText(welcome, Menu.welcome).catch(() => {});
});

bot.action('about', ({ answerCbQuery, editMessageText }) => {
  answerCbQuery();
  editMessageText(about, Menu.back).catch(() => {});
});

bot.action(
  /^rule:/,
  ({ answerCbQuery, callbackQuery: { data }, editMessageText }) => {
    answerCbQuery();
    const rule = rules.find((o) => o.id === data);
    if (!rule) {
      return;
    }
    editMessageText(
      `<b>${rule.title}</b>

${rule.content}`,
      Menu.rule(data),
    ).catch(() => {});
  },
);

bot.action(
  'start',
  mw,
  ({
    answerCbQuery,
    callbackQuery: { message },
    editMessageText,
    telegram,
  }) => {
    answerCbQuery();
    const game = gm.start(message.chat.id);
    if (game) {
      editMessageText('<b>游戏开始。</b>', Menu.none).catch(() => {});
      telegram.sendMessage(game.id, game.info, Menu.game(game));
    }
  },
);

bot.action(
  'join',
  mw,
  ({ answerCbQuery, callbackQuery: { message }, from, editMessageText }) => {
    answerCbQuery();
    const game = gm.create(from, message.chat.id);
    editMessageText(game.info, Menu.game(game)).catch(() => {});
  },
);

bot.action('leave', ({ answerCbQuery, from, editMessageText }) => {
  answerCbQuery();
  const game = gm.delete(from);
  if (game) {
    editMessageText(game.info, Menu.game(game)).catch(() => {});
  }
});

bot.action(
  /^player:/,
  mw,
  ({
    answerCbQuery,
    callbackQuery: { message, data },
    from,
    deleteMessage,
  }) => {
    answerCbQuery();
    const game = gm.find(message.chat.id);
    if (game && game.isCurrent(from.id)) {
      game.selectPlayer(Number(data.substring(7)));
      deleteMessage().catch(() => {});
    }
  },
);

bot.action(
  /^number:/,
  mw,
  ({
    answerCbQuery,
    callbackQuery: { message, data },
    from,
    deleteMessage,
  }) => {
    answerCbQuery();
    const game = gm.find(message.chat.id);
    if (game && game.isCurrent(from.id)) {
      const number = data.substring(7);
      game.selectNumber(Number(number));
      deleteMessage().catch(() => {});
    }
  },
);

bot.action(
  /^view:/,
  mw,
  ({ callbackQuery: { message, data }, from, answerCbQuery }) => {
    const game = gm.find(message.chat.id);
    if (game) {
      const number = Number(data.substring(5));
      const card = game.discarded[number];
      if (!card) {
        return;
      }
      answerCbQuery(card.record.privateContent[from.id] || '--- 机密 ---');
    }
  },
);
