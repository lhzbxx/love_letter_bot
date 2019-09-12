interface Rule {
  id: string;
  title: string;
  content: string;
}

const rules: Rule[] = [
  {
    id: 'rule:background',
    title: '游戏背景',
    content:
      '在《情书》游戏中，玩家扮演的是公主的追求者。游戏目标是将自己的情书送到公主（或离公主最亲近的人）手中。',
  },
  {
    id: 'rule:card',
    title: '卡牌介绍',
    content: '作者太懒了，还没写。',
  },
  {
    id: 'rule:victory',
    title: '胜利条件',
    content: '作者太懒了，还没写。',
  },
  {
    id: 'rule:tips',
    title: '小技巧',
    content: '作者太懒了，还没写。',
  },
];

export { rules };
