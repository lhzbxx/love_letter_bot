import { bot } from '.';
import { ee } from '../mw/event-center';
import { Menu } from './menu';
import { Game } from '../core/game';

ee.on('gameInfo', (game) => {
  bot.telegram.sendMessage(game.id, game.info, Menu.game(game));
});

ee.on('gameOver', (game) => {
  if (game.players.length === 1) {
    const winner = game.players.pop();
    bot.telegram.sendMessage(
      game.id,
      `场上的玩家只有一人，${winner.description} 胜出。\n其手牌为 ${winner.hand.description}`,
      Menu.nextRound,
    );
  } else {
    let max = Math.max.apply(Math, game.players.map((o) => o.hand.value));
    let winners = game.players.filter((o) => o.hand.value === max);
    if (winners.length > 1) {
      max = Math.max.apply(
        Math,
        game.players.map((o) => game.discardedValue[o.id] || 0),
      );
      winners = winners.filter((o) => game.discardedValue[o.id] === max);
    }
    bot.telegram.sendMessage(
      game.id,
      `场上玩家的手牌分别为：
${game.players.map((o) => `${o.description}：${o.hand.description}`).join('\n')}
其中 ${winners.map((o) => o.description).join('、')} 点数最大，${
        winners.length > 1 ? '平局' : '胜出'
      }。`,
      Menu.nextRound,
    );
  }
});

ee.on('takeEffect', (card, after) => {
  let s = card.record.content;
  const { eliminated } = card.record;
  if (eliminated && eliminated.hand) {
    s += `\n${eliminated.description} 被淘汰，其手牌为 ${eliminated.hand.description}。`;
  }
  if (s) {
    bot.telegram
      .sendMessage(
        card.currentGame.id,
        s,
        Object.keys(card.record.privateContent).length
          ? Menu.view(card.index)
          : Menu.none,
      )
      .then(() => {
        after();
      });
  } else {
    after();
  }
});

ee.on('selectPlayer', (game: Game) => {
  const { selectablePlayers: players } = game;
  if (players.length) {
    bot.telegram.sendMessage(
      game.id,
      `由 ${game.players[0].description} 选择下面的某个玩家作为目标。`,
      Menu.players(players),
    );
  } else {
    bot.telegram.sendMessage(
      game.id,
      '场上没有可选择的玩家（受到保护），跳过卡牌的效果。',
    );
  }
});

ee.on('selectNumber', (game: Game) => {
  const { selectableNumbers: numbers } = game;
  bot.telegram.sendMessage(
    game.id,
    `由 ${game.players[0].description} 指定下面的某个数字。`,
    Menu.numbers(numbers),
  );
});
