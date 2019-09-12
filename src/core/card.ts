import { Player } from './player';
import { ee } from '../mw/event-center';

/**
 * 指定。
 */
export type Selecting =
  // 指定玩家。
  | 'player'
  // 指定数字。
  | 'number';

/**
 * 卡牌的记录，提供查询的服务。
 */
interface Record {
  // 公开的内容。
  content: string;
  // 淘汰了谁。
  eliminated?: Player;
  // uid -> 查看内容。
  privateContent: { [uid: number]: string };
}

export abstract class Card {
  // 标识符。
  get id() {
    return this.constructor.name;
  }
  // 索引。
  index: number;
  // 角色。
  abstract role: string;
  // 点数。
  abstract value: number;
  // 阶段。
  stages: (Selecting | 'takeEffect')[] = [];
  // 指定玩家能否包括自己。
  includingOwner = false;
  // 选择的玩家。
  selectedPlayer?: Player;
  // 选择的数字。
  selectedNumber?: number;
  // 持有者。
  owner: Player;
  // 记录。
  record: Record = { content: '', privateContent: {} };
  // 执行效果。
  abstract takeEffect(): void;
  // 描述方式。
  get description() {
    return `<b>${this.value}-${this.role}</b>`;
  }
  get plainDescription() {
    return `${this.value}-${this.role}`;
  }
  // 当前的游戏。
  get currentGame() {
    return this.owner.currentGame;
  }
  // 创建私密信息。
  protected mSecret(uid: number, content: string) {
    this.record.privateContent[uid] = content;
  }
}

export const check = (card: Card) => {
  const hand = card.owner.hand;
  if (
    hand instanceof Countess &&
    (card instanceof King || card instanceof Prince)
  ) {
    card.stages = [];
    card.takeEffect = () => {
      card.currentGame.eliminatePlayer(card.owner);
      card.record.content = `${card.owner.description} 手中有国王或王子，触发了女伯爵的潜规则，出局。`;
      card.record.eliminated = card.owner;
    };
  }
};

/**
 * Lose if discarded.
 */
class Princess extends Card {
  role = '公主';
  value = 8;
  takeEffect() {
    this.currentGame.eliminatePlayer(this.owner);
    this.record.content = `${this.owner.description} 弃置了公主，出局。`;
    this.record.eliminated = this.owner;
  }
}

/**
 * Must be played if you have King or Prince in hand.
 */
class Countess extends Card {
  role = '女伯爵';
  value = 7;
  takeEffect() {}
}

/**
 * Trade hands with another player.
 */
class King extends Card {
  role = '国王';
  value = 6;
  stages: Selecting[] = ['player'];
  takeEffect() {
    const card = this.owner.hand;
    this.selectedPlayer.hand.owner = this.owner;
    this.owner.cards = [this.selectedPlayer.hand];
    card.owner = this.selectedPlayer;
    this.selectedPlayer.cards = [card];
    this.record.content = `${this.owner.description} 与 ${this.selectedPlayer.description} 交换了手牌。`;
  }
}

/**
 * Choose a player. They discard their hand and draw a new card.
 */
class Prince extends Card {
  role = '王子';
  value = 5;
  stages: Selecting[] = ['player'];
  includingOwner = true;
  takeEffect() {
    const card = this.selectedPlayer.hand;
    this.currentGame.discarded.push(card);
    this.selectedPlayer.cards = [];
    if (card instanceof Princess) {
      this.currentGame.eliminatePlayer(this.selectedPlayer);
      this.record.eliminated = this.selectedPlayer;
    } else {
      this.currentGame.draw(this.selectedPlayer);
    }
    this.record.content = `${this.owner.description} 弃置了 ${this.selectedPlayer.description} 手牌并重新抽一张。
${this.selectedPlayer.description} 弃置的手牌为 ${card.description}`;
  }
}

/**
 * You cannot be chosen until your next turn.
 */
class Handmaid extends Card {
  role = '侍女';
  value = 4;
  takeEffect() {
    this.owner.protected = true;
    this.record.content = `${this.owner.description} 在下一次抽牌前受到侍女的保护，不受任何卡牌效果的影响。`;
  }
}

/**
 * Compare hands with another player, lower number is out.
 */
class Baron extends Card {
  role = '男爵';
  value = 3;
  stages: Selecting[] = ['player'];
  takeEffect() {
    const value1 = this.owner.hand.value;
    const value2 = this.selectedPlayer.hand.value;
    this.record.content = `${this.owner.description} 与 ${this.selectedPlayer.description} 进行了拼点。\n`;
    if (value1 === value2) {
      this.record.content += '两个人手牌的点数相同。';
      return;
    }
    if (value1 < value2) {
      this.currentGame.eliminatePlayer(this.owner);
      this.record.eliminated = this.owner;
      this.record.content += `${this.owner.description} 的点数更小，出局。`;
    }
    if (value1 > value2) {
      this.currentGame.eliminatePlayer(this.selectedPlayer);
      this.record.eliminated = this.selectedPlayer;
      this.record.content += `${this.selectedPlayer.description} 的点数更小，出局。`;
    }
  }
}

/**
 * Look a player's hand.
 */
class Priest extends Card {
  role = '牧师';
  value = 2;
  stages: Selecting[] = ['player'];
  takeEffect() {
    const card = this.selectedPlayer.hand;
    this.record.content = `${this.owner.description} 查看了 ${this.selectedPlayer.description} 的手牌。`;
    this.mSecret(
      this.owner.id,
      `${this.selectedPlayer.username} 的手牌为 ${card.plainDescription}`,
    );
  }
}

/**
 * Guess a player's hand, if correct the player is out.
 */
class Guard extends Card {
  role = '侍卫';
  value = 1;
  stages: Selecting[] = ['player', 'number'];
  takeEffect() {
    this.record.content = `${this.owner.description} 猜测 ${this.selectedPlayer.description} 手牌的点数为 ${this.selectedNumber}。\n`;
    if (this.selectedNumber === this.selectedPlayer.hand.value) {
      this.currentGame.eliminatePlayer(this.selectedPlayer);
      this.record.eliminated = this.selectedPlayer;
      this.record.content += '猜中了！';
    } else {
      this.record.content += '没猜中。';
    }
  }
}

/**
 * 基本牌堆（2-4 玩家）。
 */
const basic = () => [
  new Princess(),
  new Countess(),
  new King(),
  new Prince(),
  new Prince(),
  new Handmaid(),
  new Handmaid(),
  new Baron(),
  new Baron(),
  new Priest(),
  new Priest(),
  new Guard(),
  new Guard(),
  new Guard(),
  new Guard(),
  new Guard(),
];

/**
 * 拓展牌堆（5-8 玩家）。
 */
const expansion = () => [];

export const generateDeck = (numPlayer: '2-4' | '5-8'): Card[] => {
  const deck = basic();
  if (numPlayer === '2-4') {
    return deck;
  }
  if (numPlayer === '5-8') {
    return deck.concat(expansion());
  }
};
