import { Game } from './game';
import { Card } from './card';
import { User } from 'telegram-typings';

export class Player {
  // Telegram 提供的用户信息。
  private user: User;
  // 当前的游戏。
  currentGame: Game;
  // 注意：玩家不在自己的回合时，只有一张手牌。
  cards: Card[] = [];
  // 被侍女保护，在下一轮前不受影响。
  protected: Boolean = false;

  constructor(user: User) {
    this.user = user;
  }

  get id(): number {
    return this.user.id;
  }

  get description(): string {
    const { first_name, username } = this.user;
    let s = username
      ? `<a href="t.me/${username}">${first_name}</a>`
      : `<b>${first_name}</b>`;
    if (this.protected) {
      s += '（保护）';
    }
    return s;
  }

  get at(): string {
    const { first_name, id } = this.user;
    return `<a href="tg://user?id=${id}">${first_name}</a>`;
  }

  get username(): string {
    const { first_name, username } = this.user;
    return first_name + username ? ` @${username}` : '';
  }

  get hand() {
    return this.cards[0];
  }

  reinit() {
    this.cards = [];
    this.protected = false;
  }
}
