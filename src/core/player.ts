import { Game } from './game';
import { Card } from './card';
import { User } from 'telegram-typings';

export class Player {
  // Telegram 提供的用户信息。
  user: User;
  // 当前的游戏。
  currentGame: Game;
  // 注意：玩家不在自己的回合时，只有一张手牌。
  cards: Card[] = [];
  // 被侍女保护，在下一轮前不受影响。
  protected: Boolean = false;

  constructor(user: User, game?: Game) {
    this.user = user;
    this.currentGame = game;
  }

  get id() {
    return this.user.id;
  }

  get description() {
    return ` @${this.user.username} `;
  }

  get alive() {
    return this.currentGame.currentPlayers.some((o) => this.id === o.id);
  }

  get isCurrent() {
    return this.currentGame.isCurrentPlayer(this.id);
  }

  beforeRound() {
    // 回合开始前，终止「保护」状态。
    this.protected = false;
  }

  draw() {
    const card = this.currentGame.deck.pop();
    card.owner = this;
    this.cards.push(card);
  }

  discard(card: Card, takeEffect = true) {
    if (!card) {
      return;
    }

    if (takeEffect) {
      let player: Player;
      if (card.require.player) {
        // todo: 选择玩家。
      }
      let number: number;
      if (card.require.number) {
        // todo: 选择数字。
      }
      card.takeEffect(player, number);
    }
  }

  knockout() {
    const index = this.currentGame.currentPlayers.findIndex(
      (i) => i.description === this.description,
    );
    if (index > -1) {
      this.currentGame.currentPlayers.splice(index, 1);
    }
    // 余下的手牌交出去。
    this.discard(this.cards);
  }

  discardableCards() {}
}
