import { Game } from './core/game';
import { Player } from './core/player';
import { ContextMessageUpdate } from 'telegraf';
import {
  InlineQueryResult,
  InlineQueryResultCachedSticker,
} from 'telegraf/typings/telegram-types';

export class GameManager {
  private games: { [id: string]: Game } = {};
  private players: { [id: string]: Player } = {};

  createGame(bot: ContextMessageUpdate) {
    const id = bot.chat.id;
    if (this.games[id]) {
      bot.reply('游戏已创建，发送 /join 加入，或 /start 开始。');
      return;
    }
    const uid = bot.message.from.id;
    if (this.players[uid]) {
      bot.reply(
        '玩家已在另一局游戏中，请到当前对局的群组发送 /leave 离开游戏。',
      );
      return;
    }
    const game = new Game(bot);
    this.games[id] = game;
    const { creator } = game;
    this.players[creator.id] = creator;
    bot.reply('游戏已创建，发送 /join 加入，或 /start 开始。');
  }

  joinGame(bot: ContextMessageUpdate) {
    const id = bot.chat.id;
    const game = this.games[id];
    if (!game) {
      bot.reply('游戏尚未创建，发送 /create 创建游戏。');
      return;
    }
    const player = new Player(bot.message.from, game);
    game.addPlayer(player);
    if (game.state === 'open') {
      bot.reply('游戏正在进行中，下一局开始后自动加入。');
      return;
    }
    bot.reply(`${player.description}加入了游戏。`);
  }

  leaveGame(bot: ContextMessageUpdate) {
    const uid = bot.message.from.id;
    const player = this.players[uid];
    if (!player) {
      bot.reply('不在游戏中。');
      return;
    }
    const game = player.currentGame;
    if (uid === game.creator.id) {
      bot.reply(`创建者${player.description}离开了游戏，游戏结束。`);
      delete this.games[game.id];
      game.players.forEach((i) => {
        delete this.players[i.id];
      });
    } else if (game.state === 'open') {
      bot.reply(`${player.description}离开了游戏。`);
    } else {
      game.state = 'open';
      bot.reply(`${player.description}离开了游戏，本回合结束。`);
    }
  }

  startGame(bot: ContextMessageUpdate) {
    const id = bot.chat.id;
    const game = this.games[id];
    if (!game) {
      bot.reply('游戏尚未创建，发送 /create 创建游戏。');
      return;
    }
    if (game.state === 'open') {
      game.start();
    } else {
      bot.reply(
        `游戏已经开始，轮到${game.currentPlayers[0].description}出牌。`,
      );
    }
  }

  inlineQuery(bot: ContextMessageUpdate) {
    const uid = bot.inlineQuery.from.id;
    const player = this.players[uid];
    const results: InlineQueryResult[] = [];
    if (!player || player.currentGame.state === 'open') {
      // 尚未开始游戏。
    } else if (player.isCurrent) {
      const game = player.currentGame;
      switch (game.state) {
        case 'discard': {
          results.push(
            ...player.cards.map((i, index) => ({
              type: 'sticker',
              id: `discard:${index}`,
              sticker_file_id: i.fid,
            })),
          );
          break;
        }
        case 'choosePlayer': {
          const players = game.currentPlayers;
          // if (game.lastCard.noOneself) {
          //   players.splice(players.findIndex((i) => i.id === player.id), 1);
          // }
          // todo: 选项为空的处理！
          results.push(
            ...players.map((i) => ({
              type: 'article',
              id: `choose-player:${i.id}`,
              title: '指定一名玩家',
              description: i.description,
              input_message_content: {
                message_text: i.description,
              },
            })),
          );
          break;
        }
      }
    } else {
      // 非当前玩家的操作。
    }
    bot.answerInlineQuery(results, { cache_time: 0 });
  }

  chosenInlineResult(bot: ContextMessageUpdate) {
    const uid = bot.chosenInlineResult.from.id;
    const player = this.players[uid];
    if (!player) {
      return;
    }
    const result = bot.chosenInlineResult.result_id;
    if (result.startsWith('discard:')) {
      const index = Number(result.substring('discard:'.length));
      const card = player.cards[index];
      player.currentGame.discard(card);
    } else if (result.startsWith('choose-player:')) {
      const uid = Number(result.substring('choose-player:'.length));
      player.currentGame.choosePlayer(uid);
    }
    //   const game = player.game;
    //   if (!game.chosenPlayer && card.require.player) {
    //     game.state === 'choosePlayer';
    //     const players = game.currentPlayers;
    //     if (card.noOneself) {
    //       players.splice(players.findIndex((i) => i.id === player.id), 1);
    //     }
    //     bot.telegram.sendMessage(
    //       game.id,
    //       `由${player.description}指定一名玩家。`,
    //       {
    //         reply_markup: {
    //           inline_keyboard: [
    //             players.map((i) => ({
    //               text: i.description,
    //               callback_data: `player:${i.id}`,
    //             })),
    //           ],
    //         },
    //       },
    //     );
    //     return;
    //   }
    //   if (!game.chosenNumber && card.require.player) {
    //     game.state === 'chooseNumber';
    //     return;
    //   }
    // }
  }
}
