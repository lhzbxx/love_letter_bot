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
    );
  }
};

bot.action('welcome', ({ editMessageText }) => {
  editMessageText(welcome, Menu.welcome);
});

bot.action('about', ({ editMessageText }) => {
  editMessageText(about, Menu.back);
});

bot.action(/^rule:/, ({ callbackQuery: { data }, editMessageText }) => {
  const rule = rules.find((o) => o.id === data);
  if (!rule) {
    return;
  }
  editMessageText(
    `<b>${rule.title}</b>

${rule.content}`,
    Menu.rule(data),
  );
});

bot.action(
  'start',
  mw,
  ({ callbackQuery: { message }, editMessageText, telegram }) => {
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
  ({ callbackQuery: { message }, from, editMessageText }) => {
    const game = gm.create(from, message.chat.id);
    editMessageText(game.info, Menu.game(game)).catch(() => {});
  },
);

bot.action('leave', ({ from, editMessageText }) => {
  const game = gm.delete(from);
  if (game) {
    editMessageText(game.info, Menu.game(game)).catch(() => {});
  }
});

bot.action(
  /^player:/,
  mw,
  ({ callbackQuery: { message, data }, from, deleteMessage }) => {
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
  ({ callbackQuery: { message, data }, from, deleteMessage }) => {
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
