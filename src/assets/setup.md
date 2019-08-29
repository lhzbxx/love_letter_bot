# 初始化

### 添加 config.json

向 @BotFather 申请 bot，保存 config.json 到 `src/` 目录下。

```json
{
  "token": "<TOKEN>"
}
```

### 设置

1. 向 @BotFather 发送 /setuserpic 发送 `src/assets/logo.png` 设置头像。

2. 向 @BotFather 发送 /setabout 设置「关于」。

   ```markdown
   桌面游戏《情书》的机器人。
   ```

3. 向 @Botfather 发送 /setdescription 设置介绍。

   ```markdown
   我是桌面游戏《情书》的机器人。

   🕒 时长：2 ～ 5 分钟
   👫 玩家：2 ～ 8 人
   🎲 类型：卡牌、逻辑推理、随机

   简介：玩家扮演宫廷中的角色，为了公主的欢心展开了残酷的较量——试探对手的身份，坚持到最后。回合开始时，每位玩家各有一张牌。随后，玩家依次抽一张牌并打出，执行卡牌上的效果。直到在场玩家仅剩一人，或者牌库为空，牌面上点数最大的玩家获胜。

   💌 游戏界面由导航按钮与 inline 命令组成，非常简单！把 bot 添加到群组中，发送 /start 开始游戏吧。
   ```

4. 向 @BotFather 发送 /setcommands 设置命令提示。

   ```markdown
   start - 开始游戏。
   ref - 查看提示卡。
   ```

5. 向 @BotFather 发送 /setinline 开启 inline 模式。

   ```markdown
   ⬆️ 轮到你了 ⬆️
   ```

6. ⚠️ 向 @BotFather 发送 /setinlinefeedback 开启 inline 的反馈。
