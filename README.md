# Love Letter Bot

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](./LICENSE)
[![Build Status](https://travis-ci.com/lhzbxx/love_letter_bot.svg?branch=master)](https://travis-ci.com/lhzbxx/love_letter_bot)

通过 Telegram Bot 玩《[情书](<https://en.wikipedia.org/wiki/Love_Letter_(card_game)>)》，运行在 [@BG_LoveLetterBot](https://t.me/BG_LoveLetterBot)。

### 运行环境

- Node.js >= 12

运行方式：

```shell
# 安装依赖。
yarn
# 开发环境下。
yarn dev
# 容器环境。
docker pull lhzbxx/love-letter-bot && docker run --rm -it lhzbxx/love-letter-bot
```

### 设计

- 通过 inline 命令，控制整个游戏流程。
  - /start - 开始游戏。
  - /ref - 查看指南。
- 利用 inline_query 出牌。

### ToDo

1. <del>实现整个游戏流程。</del>
2. <del>持续集成与部署。</del>
3. 记录战绩。
4. 拓展 4-8 玩家的规则。
5. 支持更多命令：
   1. /kick - 踢出某位玩家。
   2. /pile - 查看牌堆。
   3. ……
6. 国际化。
