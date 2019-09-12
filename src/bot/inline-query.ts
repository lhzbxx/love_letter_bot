import { InlineQueryResult as Result } from 'telegraf/typings/telegram-types';
import { bot } from '.';
import { getSticker } from './sticker';
import { gm } from '../mw/game-manager';

bot.on(
  'chosen_inline_result',
  ({ chosenInlineResult: { from, result_id } }) => {
    const game = gm.findByUid(from.id);
    if (!game || !game.isCurrent(from.id)) {
      return;
    }
    const index = Number(result_id);
    game.discard(index);
  },
);

bot.on(
  'inline_query',
  ({
    inlineQuery: {
      from: { id },
    },
    answerInlineQuery,
  }) => {
    const game = gm.findByUid(id);
    let results: Result[] = [];
    if (game) {
      const isCurrent = game.isCurrent(id);
      const stickers = ((x) =>
        x ? x.cards.map((o) => getSticker(o, !isCurrent)) : [])(
        game.findPlayer(id),
      );
      results = stickers.map(
        (o, index): Result => ({
          type: 'sticker',
          id: index.toString(),
          sticker_file_id: o,
          input_message_content:
            isCurrent && game.stage === 'discard'
              ? undefined
              : {
                message_text: game.info,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
              },
        }),
      );
    }
    answerInlineQuery(results, { cache_time: 0 });
  },
);
