import { bot } from '.';
import { ee } from '../mw/event-center';
import { gm } from '../mw/game-manager';
import { Menu } from './menu';
import { welcome } from './i18n';

bot.command(['start', 'start@BG_LoveLetterBot'], ({ from, chat, reply }) => {
  if (chat.type === 'group') {
    // 如果在群组里，则创建游戏、显示当前的游戏信息和选项。
    const game = gm.create(from, chat.id);
    ee.emit('gameInfo', game);
  } else {
    // 如果不在群组里，则发送「帮助」信息。
    reply(welcome, Menu.welcome);
  }
});

bot.help(({ reply }) => {
  reply(welcome, Menu.welcome);
});

bot.command(
  ['ref', 'ref@BG_LoveLetterBot'],
  ({ chat: { id }, replyWithPhoto }) => {
    const game = gm.find(id);
    // 根据游戏人数发送对应的提示。
    if (game && game.waitingPlayers.length > 4) {
      replyWithPhoto('');
    } else {
      replyWithPhoto(
        'AgADBQADyqgxGxrpmFck780Kp7V_yVKBAjMABAEAAwIAA3gAA5KqAQABFgQ',
      );
    }
  },
);
