import WebSocket from "ws";

import { mongoDB, IStoredBot, EBotType, BotTradingDto, events, IStoredAutoBot, ETradingInitiator, ESocketType } from "@torobot/shared";
import { BotClient } from "./botClient"
import { AutoBotClient } from "./autobotClient"
import { VolumeBotClient } from "./volumebotClient"
import { logger } from "../utils";

export type BotList = { [id: string]: BotClient }
export const bots: BotList = {};
export type AutoBotList = {[id: string]: AutoBotClient}
export const autobots: AutoBotList = {};
export type VolumeBotList = { [id: string]: VolumeBotClient }
export const volumebots: VolumeBotList = {};

function logPrefix() {
  return `botIndex`;
}

function getBot(botId: string):BotClient {
  return bots[botId];
}

function getAutoBot(botId: string):AutoBotClient {
  return autobots[botId];
}

async function createBot(trading: BotTradingDto, bot: IStoredBot) {
  let botClient = getBot(trading.botId);
  if (!botClient) {
    botClient = new BotClient(bot);
    botClient.on(events.transaction, () => onTransaction(trading.botId));
    botClient.on(events.updated, () => onUpdated(trading.botId));
    botClient.on(events.finished, () => onFinished(trading.botId));
    bots[trading.botId] = botClient;
    await botClient.init();
    await botClient.start(trading.thread);
  }
}

async function deleteBot(botId: string, stop: boolean=false, trading: BotTradingDto=null) {
  const botClient = getBot(botId);
  if (botClient) {
    if (stop) {
      if (!trading.thread) {
        botClient.stop();
      } else {
        botClient.stopThread();
      }
      await onUpdated(botId);
    }  
  }
  if (!trading || !trading.thread || trading.thread && botClient.botThreads.length === 0) {
    if (stop) {
      delete bots[botId];
    }
  }
}

async function onTransaction(botId: string, initiator = ETradingInitiator.BOT) {
  const client = initiator === ETradingInitiator.BOT ? getBot(botId) : getAutoBot(botId);
  if (client) {
    logger.log(logPrefix(), 'info', `onTransaction: ${JSON.stringify(client.transaction)}`);
    await mongoDB.Transactions.create(client.transaction);
  }
}

async function onUpdated(botId: string) {
  const botClient = getBot(botId);
  if (botClient) {
    logger.log(logPrefix(), 'info', `onUpdated: ${botId}, ${botClient.bot.state.status}, ${botClient.bot.state.thread}, ${botClient.bot.state.result}`);
    await mongoDB.Bots.findOneAndUpdate({ _id: botId }, {
      state: botClient.bot.state,
      statistics: botClient.bot.statistics,
    });
  }
}

async function onFinished(botId: string) {
  logger.log(logPrefix(), 'info', `onFinished: ${botId}`);
  await onUpdated(botId);
  await deleteBot(botId);
}

/////////////////////////////////////////////////////////////////////////
export async function triggerBot(trading: BotTradingDto) {
  if (trading.active) {
    const bot: any = await mongoDB.Bots.populateModel(mongoDB.Bots.findById(trading.botId), false);
    await createBot(trading, bot);
  } else {
    await deleteBot(trading.botId, true, trading);
  }
  return trading;
}

export async function startBot(botId: string, type: EBotType ) {
  await mongoDB.Bots.findOneAndUpdate({ _id: botId }, {'state.active': true, type});
  return triggerBot({ botId, active: true});
}

export async function stopBot(botId: string) {
  await mongoDB.Bots.findOneAndUpdate({ _id: botId }, {'state.active': false});
  return triggerBot({ botId, active: false});
}

///testing//////////////////////////////////////////////////////////
// startBot("61c4b8a367479d1cc0d6ae42", EBotType.SELL)
// startBot("61ca3e84aeb0f11ca4d4dbab", EBotType.BUY)
// triggerBot({
//   botId: "61ca3e84aeb0f11ca4d4dbab",
//   active: true,
//   thread: ETradingThread.BUYING_INSTANT
// })

// startBot("61cca450feb72354e0d0dfc2", EBotType.BUY)

// --------------- AUTO BOT ------------------//

export async function triggerAutoBot(botId: string, active: boolean, wsServer: WebSocket.Server) {
  if (active) {
    await createAutoBot(botId, wsServer);
    await startAutoBot(botId);
  } else {
    await stopAutoBot(botId);
  }
  return botId;
}

export async function withdrawAutoBotSubWallet(botId: string, wsServer: WebSocket.Server) {
  if (!getAutoBot(botId)) {
    await createAutoBot(botId, wsServer);
  }

  const autobotClient = getAutoBot(botId);
  const retVal = await autobotClient.withdraw();
  const wsData = {
    type: ESocketType.AUTO_BOT_WITHDRAW,
    data: {
      botId: botId,
      success: retVal
    }
  };
  wsServer.clients.forEach(client => {
    client.send(JSON.stringify(wsData));
  });
}

export async function AutoBotSubWalletInfo(botId: string, wsServer: WebSocket.Server) {
  if (!getAutoBot(botId)) {
    await createAutoBot(botId, wsServer);
  }

  const autobotClient = getAutoBot(botId);
  const retVal = await autobotClient.getSubWalletInfo();
  console.log("--------> sub wallet info", retVal);
  // const wsData = {
  //   type: ESocketType.AUTO_BOT_SUB_WALLET_INFO,
  //   data: {
  //     botId: botId,
  //     walletInfo: retVal
  //   }
  // };
  // wsServer.clients.forEach(client => {
  //   client.send(JSON.stringify(wsData));
  // });
}

async function createAutoBot(botId: string, wsServer: WebSocket.Server) {
  let autobotClient = getAutoBot(botId);
  if (!autobotClient) {
    const bot: any = await mongoDB.AutoBots.populateModel(mongoDB.AutoBots.findById(botId), false);
    autobotClient = new AutoBotClient(bot, wsServer);
    autobotClient.on(events.transaction, () => onTransaction(botId, ETradingInitiator.AUTO));
    autobots[botId] = autobotClient;
    await autobotClient.init();
  }
}

async function startAutoBot(botId: string) {
  let autobotClient = getAutoBot(botId);
  if (autobotClient) {
    await autobotClient.start();
  }
}

async function stopAutoBot(botId: string) {
  let autobotClient = getAutoBot(botId);
  if (autobotClient) {
    autobotClient.stop();
    delete autobots[botId];
  }
}

async function deleteAutoBot(botId: string) {
  let autobotClient = getAutoBot(botId);
  if (autobotClient) {
    autobotClient.stop();
    delete autobots[botId];
  }
}

// -------------------- VolumeBot -----------------------------

function getVolumeBot(botId: string): VolumeBotClient {
  return volumebots[botId];
}

async function createVolumeBot(botId: string, wsServer: WebSocket.Server) {
  let volumebotClient = getVolumeBot(botId);
  if (!volumebotClient) {
    const bot: any = await mongoDB.VolumeBots.populateModel(mongoDB.VolumeBots.findById(botId), false);
    volumebotClient = new VolumeBotClient(bot, wsServer);
    volumebots[botId] = volumebotClient;
    await volumebotClient.init();
  }
}

export async function startVolumeBot(botId: string) {
  let volumebotClient = getVolumeBot(botId);
  if (volumebotClient) {
    await volumebotClient.start();
  }
}

export async function stopVolumeBot(botId: string) {
  let volumebotClient = getVolumeBot(botId);
  if (volumebotClient) {
    volumebotClient.stop();
    delete volumebots[botId];
  }
}

export async function triggerVolumeBot(botId: string, active: boolean, wsServer: WebSocket.Server) {
  if (active) {
    await createVolumeBot(botId, wsServer);
    await startVolumeBot(botId);
  } else {
    await stopVolumeBot(botId);
  }
  return botId;
}