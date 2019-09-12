import telegraf from 'telegraf';
import httpsProxyAgent from 'https-proxy-agent';
import { token } from '../config.json';

const bot = new telegraf(token, {
  // todo: 根据 process.env.environment 判断是否需要代理。
  telegram: { agent: new httpsProxyAgent('http://127.0.0.1:1087') },
});

export { bot };

import './action';
import './command';
import './inline-query';
import './listener';

export const bootstrap = () => {
  bot.startPolling(2);
};
