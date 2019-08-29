import { Game } from '../core/game';
import { Player } from '../core/player';
import { User } from 'telegram-typings';

const uid = (user: User) => `u:${user.id}`;

export class GameManager {
  // id or uid -> game
  private games: { [id: string]: Game } = {};

  start(user: User, id: number): Game {
    let game = this.games[uid(user)];
    if (game) {
      // 玩家已在游戏中。
      if (game.id === id) {
        // 玩家在该群组的游戏中。
        return game;
      }
      // 玩家不在该群组的游戏中，在当前的游戏中移除该玩家。
      // 注意：如果当前游戏进行中，则中断，并通知群组。
      game.removePlayer(user.id);
    }
    // 玩家不在游戏中。
    const player = new Player(user);
    if (!this.games[id]) {
      // 当前群组未创建游戏。
      game = new Game(id);
    }
    // 注意：如果是游戏开始后加入，通知用户「下一轮才能玩」。
    game.addPlayer(player);
    return game;
  }

  find(id: number) {
    return this.games[id];
  }
}
