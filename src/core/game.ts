import { Player } from './player';
import { Selecting, Card, generateDeck, check } from './card';
import { ee } from '../mw/event-center';

// Knuth-Durstenfeld 洗牌算法。
const shuffle = <T>(arr: T[]): T[] => {
  let n = arr.length;
  let random: number;
  while (n !== 0) {
    random = (Math.random() * (n -= 1)) >>> 0;
    [arr[n], arr[random]] = [arr[random], arr[n]];
  }
  return arr;
};

type GameStage =
  // 初始状态。
  | 'open'
  // 中断（玩家退出）。
  | 'suspend'
  // 出牌。
  | 'discard'
  // 指定玩家、数字。
  | Selecting
  // 结算。
  | 'takeEffect';

type GameMode = '2 player' | '3-4 player' | '5-8 player';

export class Game {
  // ID。
  id: number;
  // 游戏状态。
  stage: GameStage = 'open';
  // 游戏模式。
  mode: GameMode;
  // 抽牌堆。
  deck: Card[] = [];
  // 顶牌（隐藏）。
  topCard: Card;
  // 弃牌堆。
  discarded: Card[] = [];
  // 玩家。
  players: Player[] = [];
  // 等待列表。
  waitingPlayers: Player[] = [];

  /**
   * 游戏信息。
   */
  get info(): string {
    if (this.started) {
      return (
        `${
          this.discarded.length && this.discarded.some((o) => !!o.owner)
            ? ''
            : this.mode === '2 player'
            ? `只有两名玩家开始游戏的时候，移除牌堆顶部的三张牌：${this.discarded
                .slice(0, 3)
                .map((o) => o.description)
                .join('、')}。\n\n`
            : '游戏开始，移除牌堆顶部的一张牌（不公开）。\n\n'
        }` +
        `轮到 ${this.players[0].description} ` +
        `输入 <code>@BG_LoveLetterBot</code> 出牌。
其余玩家借此查看手牌。

牌库中还有 ${this.deck.length} 张牌。

接下来的出牌顺序为：${this.players
          .slice(1)
          .map((o) => o.description)
          .join('、') || '-'}。`
      );
    }
    return `《情书》支持 <b>2-8</b> 名玩家游戏。

准备中的玩家（${this.waitingPlayers.length}）：
${this.waitingPlayers.map((o) => o.description).join('、') || '-'}`;
  }

  /**
   * 游戏人数是否到达上限。
   */
  get joinable(): boolean {
    return this.waitingPlayers.length <= 8;
  }

  /**
   * 判断游戏能否开始。
   */
  get canStart(): boolean {
    return this.waitingPlayers.length >= 2 && this.joinable;
  }

  /**
   * 判断游戏是否结束。
   */
  get isOver(): boolean {
    return this.players.length === 1 || this.deck.length === 0;
  }

  /**
   * 当前的出牌（最后一张牌）。
   */
  get lastCard(): Card {
    return this.discarded[this.discarded.length - 1];
  }

  /**
   * 游戏是否开始。
   */
  get started(): boolean {
    return this.stage !== 'open' && this.stage !== 'suspend';
  }

  /**
   * 可选择的玩家。
   */
  get selectablePlayers(): Player[] {
    if (this.lastCard.includingOwner) {
      return this.players.filter((o) => !o.protected);
    }
    const { owner } = this.lastCard;
    return this.players.filter((o) => !o.protected && o.id !== owner.id);
  }

  /**
   * 可选择的数字。
   */
  get selectableNumbers(): number[] {
    return [2, 3, 4, 5, 6, 7, 8];
  }

  /**
   * 弃牌点数的总和。
   */
  get discardedValue(): { [uid: number]: number } {
    return this.discarded.reduce((acc, cur: Card) => {
      if (cur.owner) {
        acc[cur.owner.id] += cur.value;
      }
      return acc;
    },                           {});
  }

  constructor(id: number) {
    this.id = id;
  }

  /**
   * 初始化。
   */
  start() {
    if (!this.canStart || this.started) {
      return;
    }
    this.players = this.waitingPlayers.slice();
    this.discarded = [];
    // 根据玩家人数，调整套牌。
    const playerNumber = this.players.length;
    if (playerNumber <= 4) {
      this.deck = generateDeck('2-4');
      if (playerNumber === 2) {
        // 两名玩家的情况，移除三张牌（明示）。
        this.deck = shuffle(this.deck);
        this.discarded.push(...this.deck.splice(0, 3));
        this.mode = '2 player';
      } else {
        this.mode = '3-4 player';
      }
    } else {
      this.deck = generateDeck('5-8');
      this.mode = '5-8 player';
    }
    this.deck = shuffle(this.deck);
    this.topCard = this.deck.pop();
    this.players = shuffle(this.players);
    this.players.forEach((o) => o.reinit());
    this.players.forEach((o) => this.draw(o));
    this.draw(this.players[0]);
  }

  /**
   * 弃牌。
   * @param index 弃牌的索引。
   */
  discard(index: number) {
    if (this.stage !== 'discard') {
      return;
    }
    const player = this.players[0];
    const card = player.cards.splice(index, 1)[0];
    check(card);
    card.index = this.discarded.length;
    card.stages.push('takeEffect');
    this.discarded.push(card);
    this.nextStage();
  }

  /**
   * 抽牌。
   * @param player 抽牌的玩家。
   */
  draw(player: Player) {
    const card = this.deck.length ? this.deck.pop() : this.topCard;
    card.owner = player;
    player.cards.push(card);
    this.stage = 'discard';
  }

  /**
   * 判断 uid 是否为当前玩家（操作）。
   * @param uid 用户 ID。
   */
  isCurrent(uid: number): boolean {
    return this.players.length && this.players[0].id === uid;
  }

  /**
   * 添加玩家。
   * @param player 玩家。
   */
  addPlayer(player: Player) {
    if (this.waitingPlayers.some((o) => o.id === player.id)) {
      return;
    }
    if (!this.joinable) {
      return;
    }
    // 注意：如果是游戏开始后加入，通知用户「下一轮才能玩」。
    player.currentGame = this;
    this.waitingPlayers.push(player);
    if (this.started) {
      ee.emit('playerWaiting', player);
    }
  }

  /**
   * 寻找（在场上的）玩家。
   * @param uid 用户 ID。
   */
  findPlayer(uid: number): Player | null {
    return this.players.find((o) => o.id === uid);
  }

  /**
   * 移除玩家。
   * 如果游戏正在进行中且玩家不只在等待区，则中断。
   * @param uid 用户 ID。
   */
  removePlayer(uid: number) {
    const player = this.waitingPlayers.find((o) => o.id === uid);
    if (player) {
      if (this.started && this.players.some((o) => o.id === uid)) {
        // 注意：如果该游戏进行中，则中断，并通知群组。
        this.stage = 'suspend';
        ee.emit('gameSuspend', this, player);
      }
      this.waitingPlayers = this.waitingPlayers.filter((o) => o.id !== uid);
    }
  }

  /**
   * 淘汰玩家。
   * @param player 用户 ID。
   */
  eliminatePlayer(player: Player) {
    const index = this.players.findIndex((o) => o.id === player.id);
    if (index < 0) {
      return;
    }
    this.players.splice(index, 1);
    this.discarded.push(player.hand);
  }

  /**
   * 下一阶段，如果阶段执行完毕，则执行下一轮次。
   */
  private nextStage() {
    const card = this.lastCard;
    if (card.stages.length) {
      this.stage = card.stages.shift();
      if (this.stage === 'player') {
        ee.emit('selectPlayer', this);
        if (!this.selectablePlayers.length) {
          this.nextTurn();
        }
      } else if (this.stage === 'number') {
        ee.emit('selectNumber', this);
      } else if (this.stage === 'takeEffect') {
        card.takeEffect();
        ee.emit('takeEffect', card, () => {
          this.nextTurn();
        });
      }
    } else {
      this.nextTurn();
    }
  }

  /**
   * 下一轮次。
   */
  nextTurn() {
    if (this.isOver) {
      this.stage = 'open';
      ee.emit('gameOver', this);
      return;
    }
    const player = this.players[0];
    this.players.splice(0, 1);
    this.players.push(player);
    this.players[0].protected = false;
    this.draw(this.players[0]);
    ee.emit('gameInfo', this);
  }

  /**
   * 选择一名玩家。
   * @param uid 用户 ID。
   */
  selectPlayer(uid: number) {
    if (this.stage !== 'player') {
      return;
    }
    const player = this.players.find((o) => o.id === uid);
    this.lastCard.selectedPlayer = player;
    this.nextStage();
  }

  /**
   * 选择一个数字。
   * @param number 数字。
   */
  selectNumber(number: number) {
    if (this.stage !== 'number') {
      return;
    }
    this.lastCard.selectedNumber = number;
    this.nextStage();
  }

  /**
   * 重置游戏，清空等待区。
   */
  reset() {
    this.stage = 'open';
    this.waitingPlayers = [];
  }
}
