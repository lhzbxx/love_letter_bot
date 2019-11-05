import telegraf from 'telegraf';
import httpsProxyAgent from 'https-proxy-agent';
import { token, proxy } from '../config.json';

const bot = new telegraf(token, {
  telegram: {
    agent: proxy ? new httpsProxyAgent('http://127.0.0.1:1087') : undefined,
  },
});

export { bot };

import './action';
import './command';
import './inline-query';
import './listener';

export const bootstrap = () => {
  if (proxy) {
    bot.startPolling(2);
  } else {
    bot.telegram.setWebhook(
      `https://love-letter-bot.herokuapp.com/bot${token}`,
    );
    bot.startWebhook(`/bot${token}`, null, Number(process.env.PORT));
  }
};
