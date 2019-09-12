import { Markup, CallbackButton as Button } from 'telegraf';
import { ExtraEditMessage as Extra } from 'telegraf/typings/telegram-types';
import { Game } from '../core/game';
import { Player } from '../core/player';
import { rules } from './rule-book';

const mExtra = (buttons: Button[][] = []): Extra => ({
  parse_mode: 'HTML',
  reply_markup: Markup.inlineKeyboard(buttons),
  disable_web_page_preview: true,
});
const mButton = Markup.callbackButton;

export namespace Menu {
  export const none = mExtra();

  export const welcome = mExtra([
    [mButton('📜 规则书', 'rule:background')],
    [mButton('😃 关于', 'about')],
  ]);

  export const rule = (id: string) => {
    const index = rules.findIndex((o) => o.id === id);
    const previous = rules[index === 0 ? rules.length - 1 : index - 1];
    const next = rules[index === rules.length - 1 ? 0 : index + 1];
    return mExtra([
      [
        mButton(`◀️ ${previous.title}`, previous.id),
        mButton(`${next.title} ▶️`, next.id),
      ],
      [mButton('↩️', 'welcome')],
    ]);
  };

  export const back = mExtra([[mButton('↩️', 'welcome')]]);

  export const game = (game: Game) => {
    const buttons: Button[][] = [];
    if (!game.started) {
      const start = [mButton('🎬 开始游戏', 'start')];
      const join = mButton('⭕ 加入', 'join');
      const leave = mButton('❌ 离开', 'leave');
      buttons.push(game.joinable ? [join, leave] : [leave]);
      if (game.canStart) {
        buttons.push(start);
      }
    }
    return mExtra(buttons);
  };

  export const players = (players: Player[]) => {
    return mExtra(players.map((o) => [mButton(o.username, `player:${o.id}`)]));
  };

  export const numbers = (numbers: Number[]) => {
    return mExtra([numbers.map((o) => mButton(o.toString(), `number:${o}`))]);
  };

  export const view = (index: number) =>
    mExtra([[mButton('👁️ 查看结果', `view:${index}`)]]);

  export const nextRound = mExtra([[mButton('🔄 再来一局', 'start')]]);
}
