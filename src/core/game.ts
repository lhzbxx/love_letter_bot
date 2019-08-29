import { Player } from './player';
import { Card, generateDeck } from './card';
import { ContextMessageUpdate } from 'telegraf';

const PLAYER_NUMBER = {
  MIN: 2,
  MAX: 8,
};

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

type GameState =
  // 初始状态，开放加入。
  | 'open'
  // 出牌。
  | 'discard'
  // 指定玩家。
  | 'choosePlayer'
  // 指定数字。
  | 'chooseNumber'
  // 结算。
  | 'takeEffect';

export class Game {
  // TG 的 bot。
  bot: ContextMessageUpdate;
  // 游戏状态。
  state: GameState = 'open';
  // 抽牌堆。
  deck: Card[] = [];
  // 顶牌（隐藏）。
  topCard: Card;
  // 弃牌堆。
  discarded: Card[] = [];
  // 当前的玩家。
  currentPlayers: Player[] = [];
  // 玩家列表。
  players: Player[] = [];
  // 指定的玩家。
  chosenPlayer?: Player;
  // 指定的数字。
  chosenNumber?: number;

  get id(): number {
    return this.bot.chat.id;
  }

  get creator(): Player {
    return this.players.find((i) => i.user.id === this.bot.message.from.id);
  }

  get hasNext(): boolean {
    // 判断游戏是否继续。
    return this.currentPlayers.length === 1 || this.deck.length === 0;
  }

  get lastCard(): Card {
    return this.discarded[0];
  }

  constructor(bot: ContextMessageUpdate) {
    this.bot = bot;
    const player = new Player(bot.from, this);
    this.players.push(player);
  }

  currentStatus() {
    // 当前状态。
  }

  start() {
    // 初始化。
    this.currentPlayers = this.players.slice();
    this.discarded = [];
    // 根据玩家人数，调整套牌。
    const playerNumber = this.currentPlayers.length + 1;
    if (playerNumber < PLAYER_NUMBER.MIN) {
      this.bot.reply('需要至少两名玩家开始游戏，输入 /join 加入游戏。');
      return;
    }
    if (playerNumber <= 4) {
      this.deck = generateDeck('basic');
      if (playerNumber === 2) {
        // 两名玩家的情况，移除三张牌（明示）。
        this.deck = shuffle(this.deck);
        const discarded = this.deck.splice(0, 3);
        this.discarded = this.discarded.concat(discarded);
        this.bot.reply(
          `当两名玩家游戏时，排除三张牌：${discarded
            .map((i) => i.description)
            .join('、')}。`,
        );
      }
    } else {
      this.deck = generateDeck('extended');
    }
    this.deck = shuffle(this.deck);
    this.topCard = this.deck.pop();
    this.currentPlayers = shuffle(this.currentPlayers);
    this.currentPlayers.forEach((i) => i.draw());
    this.draw();
    this.bot.reply(
      `拿出牌堆顶部的一张牌（不公开）。\n从 ${this.currentPlayers[0].description} 开始，输入 @QingshuBot 出牌。`,
    );
  }

  draw() {
    this.currentPlayers[0].draw();
    this.state = 'discard';
  }

  isCurrentPlayer(uid: number): boolean {
    if (this.currentPlayers.length < 1) {
      return false;
    }
    return this.currentPlayers[0].id === uid;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  removePlayer(player: Player) {
    this.players = this.players.filter((i) => i.id === player.id);
  }

  nextPlayer(): Player {
    const player = this.currentPlayers[0];
    this.currentPlayers.splice(0, 1, player);
    return player;
  }

  choosePlayer(uid: number) {
    this.chosenPlayer = this.currentPlayers.find((i) => i.id === uid);
    if (!this.chosenNumber && this.lastCard.require.number) {
      this.state = 'chooseNumber';
    } else {
      this.lastCard.takeEffect();
    }
  }

  chooseNumber(number: number) {
    this.chosenNumber = number;
  }

  discard(card: Card) {
    if (this.state === 'discard') {
      this.discarded.unshift(card);
    }
    if (card.noEffect) {
      return;
    }
    if (!this.chosenPlayer && card.require.player) {
      this.state = 'choosePlayer';
      this.bot.reply(`由${this.currentPlayers[0].description}指定一名玩家。`);
    } else if (!this.chosenNumber && card.require.number) {
      this.state = 'chooseNumber';
      this.bot.reply(`由${this.currentPlayers[0].description}指定一个数字。`);
    } else {
      card.takeEffect();
    }
  }
}
