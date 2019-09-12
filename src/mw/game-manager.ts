import { Game } from '../core/game';
import { Player } from '../core/player';
import { User } from 'telegram-typings';

const uPrefix = (uid: number) => `u:${uid}`;

class GameManager {
  // id or uid -> game
  private games: { [id: string]: Game } = {};

  /**
   * 创建游戏，或添加玩家到游戏中。
   * 对于玩家而言，有三种情况：
   * 1. 玩家不在游戏中；
   * 2. 玩家在其他游戏中；
   * 3. 玩家在该群组的游戏中。
   * @param user 用户。
   * @param id 群组 ID。
   */
  create(user: User, id: number): Game {
    let game = this.findByUid(user.id);
    if (game && game.id !== id) {
      // 玩家不在该群组的游戏中，先从之前的群组中移除。
      this.removePlayer(game, user);
    }
    // 创建游戏。
    game = this.games[id] || new Game(id);
    this.games[id] = game;

    this.addPlayer(game, user);
    return game;
  }

  /**
   * 开始游戏。
   * @param id 群组 ID。
   */
  start(id: number): Game | null {
    const game = this.find(id);
    if (game) {
      game.start();
    }
    return game;
  }

  /**
   * 从游戏中移除玩家。
   * @param user 用户。
   */
  delete(user: User): Game | null {
    const game = this.findByUid(user.id);
    if (game) {
      this.removePlayer(game, user);
    }
    return game;
  }

  /**
   * 添加玩家。
   * @param game 当前的游戏。
   * @param user 用户。
   */
  private addPlayer(game: Game, user: User): void {
    const player = new Player(user);
    game.addPlayer(player);
    this.games[uPrefix(user.id)] = game;
  }

  /**
   * 移除玩家。
   * @param game 当前的游戏。
   * @param user 用户。
   */
  private removePlayer(game: Game, user: User): void {
    game.removePlayer(user.id);
    delete this.games[uPrefix(user.id)];
  }

  /**
   * 根据群组 ID 查找游戏。
   * @param id 群组 ID。
   */
  find(id: number): Game | null {
    return this.games[id];
  }

  /**
   * 根据用户 ID 查找游戏。
   * @param uid 用户 ID。
   */
  findByUid(uid: number): Game | null {
    return this.games[uPrefix(uid)];
  }
}

export const gm = new GameManager();
