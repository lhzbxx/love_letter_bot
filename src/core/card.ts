import { Player } from './player';

export abstract class Card {
  // 角色。
  abstract role: string;
  // 点数。
  abstract number: number;
  // TG 的 fild_id。
  abstract fid: string;
  // 需要：
  require = {
    // 指定玩家。
    player: false,
    // 指定数字。
    number: false,
  };
  // 指定玩家的时候，能否指定自己。
  noOneself = true;
  // 执行效果。
  abstract takeEffect(player?: Player, number?: number): void;
  // 描述方式。
  get description() {
    return `${this.number}-${this.role}`;
  }
  // 持有者（或曾持有者）。
  owner: Player;
  // 默认生效，特殊规则下不生效。
  noEffect: boolean = false;
}

// 效果：无论何时打出这张牌，立刻被淘汰。
class Princess extends Card {
  role = '公主';
  number = 8;
  fid = 'CAADBQADFQADpv68GVdxGp-gt56IFgQ';
  takeEffect() {
    this.owner.knockout();
  }
}

// 效果：当手上有国王或王子的时候，必须弃置女伯爵。
class Countess extends Card {
  role = '女伯爵';
  number = 7;
  fid = 'CAADBQADEAADpv68GSRXwWyfRyazFgQ';
  takeEffect() {
    if (this.owner.card instanceof King || this.owner.card instanceof Prince) {
      this.owner.knockout();
    }
  }
}

// 效果：将你手上的卡与你选择的另一名玩家交换，不能选择被保护的玩家。
class King extends Card {
  role = '国王';
  number = 6;
  fid = 'CAADBQADEwADpv68GdQta3YgO4LXFgQ';
  require = {
    player: true,
    number: false,
  };
  takeEffect(player: Player) {
    const card = this.owner.card;
    this.owner.card = player.card;
    player.card = card;
  }
}

// 效果：指定一名玩家（包括自己）弃牌并抽牌，弃掉的牌不发挥效果（除了公主）。
class Prince extends Card {
  role = '王子';
  number = 5;
  fid = 'CAADBQADFAADpv68GT6MBsxTeuYpFgQ';
  require = {
    player: true,
    number: false,
  };
  noOneself = false;
  takeEffect(player: Player) {
    // const card = player.discard();
    // if (card instanceof Princess) {
    //   card.onEffect();
    // }
  }
}

// 效果：直到下一个回合，无视其他卡牌的效果。
class Handmaid extends Card {
  role = '侍女';
  number = 4;
  fid = 'CAADBQADDwADpv68GR3rMJmDA5BSFgQ';
  takeEffect() {
    this.owner.protected = true;
  }
}

// 效果：与另一名玩家拼点，点数小的淘汰，持平则无事发生。
class Baron extends Card {
  role = '男爵';
  number = 3;
  fid = 'CAADBQADEQADpv68GSmxdUM_qGwIFgQ';
  require = {
    player: true,
    number: false,
  };
  takeEffect(player: Player) {
    const number1 = this.number;
    const number2 = player.card.number;
    if (number1 < number2) {
      this.owner.knockout();
      // todo: 拼点。
    } else if (number1 > number2) {
      player.knockout();
    } else {
      // 平手。
    }
  }
}

// 效果：查看另一名玩家的手牌。
class Priest extends Card {
  role = '牧师';
  number = 2;
  fid = 'CAADBQADDgADpv68GX2EcbDQJxO2FgQ';
  require = {
    player: true,
    number: false,
  };
  takeEffect(player: Player) {
    const card = player.card;
    // todo: 向 this.owner 通知。
  }
}

// 效果：猜一张（非侍卫）牌，如果猜对，则踢出局。
class Gurad extends Card {
  role = '侍卫';
  number = 1;
  fid = 'CAADBQADEgADpv68GdOAm5J_B6SvFgQ';
  require = {
    player: true,
    number: true,
  };
  takeEffect(player: Player, number: number) {
    if (number === player.card.number) {
      player.knockout();
    } else {
      // todo: 通知。
    }
  }
}

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
  new Gurad(),
  new Gurad(),
  new Gurad(),
  new Gurad(),
  new Gurad(),
];

const extended = () => [
  // todo: 实现 5-8 人的卡牌。
];

export const generateDeck = (type: 'basic' | 'extended') => {
  switch (type) {
    case 'basic':
      return basic();
    case 'extended':
      return basic().concat(extended());
  }
};
