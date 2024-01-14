import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import * as fs from 'fs';
import config from "../../../config";
import { AutoBotDto } from '../dto/autobot.dto';
import {
  mongoDB, 
  IAutoBotDocument, 
  IUserDocument, 
  ERunningStatus, 
  ETradingInitiator, 
  AutoBotTradingDto, 
  STATUS_STOPPED, 
  STATUS_READY, 
  ETradingThread, 
  IAutoBot 
} from "@torobot/shared";
import { AutoBotEngineService } from './autobot-engine.service';
import { TokenService } from '../../token/service/token.service';
import { TransactionService } from '../../transaction/service/transaction.service';
import { PoolService } from '../../pool/service/pool.service';
import { TokenDetailReqDto } from '../../token/dto/token.dto';

@Injectable()
export class AutoBotService {
  constructor(
    private poolService: PoolService,
    private autobotEngineService: AutoBotEngineService,
    private tokenService: TokenService,
    private transactionService: TransactionService,
  ) {}

  private getInitiatorCondition(initiator: ETradingInitiator) {
    let condition = {};
    if (initiator === ETradingInitiator.BOT) {
      condition = {initiator: { $ne: ETradingInitiator.DIRECT }}
    } else if (initiator === ETradingInitiator.DIRECT) {
      condition = {initiator: ETradingInitiator.DIRECT};
    }
    return condition;
  }
  
  async create(bot: AutoBotDto, user: IUserDocument) {
    const object = await mongoDB.AutoBots.create({...bot, owner: user._id});
    const poolDoc = await this.poolService.getById(bot.pool);
    await this.poolService.update(
      await this.poolService.validate(bot.pool),
      {autoBot: object._id}
    );

    return this.getById(object._id);
  }

  async update(bot: IAutoBotDocument, body: UpdateQuery<IAutoBotDocument>) {
    await mongoDB.AutoBots.findOneAndUpdate({ _id: bot._id }, body);
    return this.getById(bot._id);
  }

  delete(bot: IAutoBotDocument) {
    return mongoDB.AutoBots.findOneAndDelete({ _id: bot._id });
  }

  async getById(botId: string) {
    const doc = await mongoDB.AutoBots.populateModel(mongoDB.AutoBots.findById(botId));
    return doc as IAutoBotDocument;
  }

  async validate(botId: string): Promise<IAutoBotDocument> {
    const doc = await this.getById(botId);

    if (!doc) {
      throw new NotFoundException('AutoBot not found');
    }

    return doc as IAutoBotDocument;
  }

  async getAll() {
    return mongoDB.AutoBots.populateModel(mongoDB.Bots.find({}).sort({created: -1}));
  }

  // async trigger(trading: AutoBotTradingDto, user: IUserDocument) {
  //   const botDoc = await this.getById(trading.botId);
  //   const bot: IAutoBot = botDoc.toObject();

  //   let result = null;
  //   if (trading.active) {
  //     const stateValues = {
  //       active: true,
  //       status: ERunningStatus.RUNNING,
  //       result: STATUS_READY,
  //       thread: ETradingThread.NONE,
  //     }
  //     const botState = bot.state.active ? bot.state : stateValues;
  //     console.log('----botState:', botState)
  //     const state = {
  //       ...botState,
  //       extends: {
  //         instant: {
  //           ...stateValues,
  //           active: trading.thread === ETradingThread.SELLING_INSTANT || trading.thread === ETradingThread.SELLING_SPAM,
  //         },
  //         stopLoss: {
  //           ...stateValues,
  //           active: false
  //         }
  //       }
  //     }
  //     await this.update(botDoc, { state });
  //     result = await this.autobotEngineService.trigger(trading);
  //   } else {
  //     const stateValues = {
  //       active: false,
  //       status: ERunningStatus.FAILED,
  //       result: STATUS_STOPPED,
  //     }
  //     const botState = stateValues;
  //     const state = {
  //       ...botState,
  //       thread: bot.state.thread,
  //       extends: {
  //         instant: {
  //           ...stateValues,
  //           thread: bot.state.extends?.instant?.thread || ETradingThread.NONE
  //         },
  //         stopLoss: {
  //           ...stateValues,
  //           thread: bot.state.extends?.stopLoss?.thread || ETradingThread.NONE
  //         }
  //       }
  //     }
  //     // await this.update(bot, { state });
  //     result = await this.autobotEngineService.trigger(trading);
  //     await this.update(botDoc, { state });
  //   }
  //   return result;
  // }

  // async getAllStatus(initiator: ETradingInitiator) {
  //   const condition = this.getInitiatorCondition(initiator);
  //   return mongoDB.Bots.find(condition).select("id state");
  // }

  async getLog(botId: string) {
    try {
      const log = fs.readFileSync(config.LOG_DIR_PATH + `/autobot/${botId}.txt`, {
        encoding: "utf8"
      })
      return log;
    } catch (e) {
      return "";
    }
  }

  async getHistory(botId: string) {
    try {
      const transactions = await this.transactionService.getsByAutoBotId(botId);
      return transactions;
    } catch (e) {
      return [];
    }
  }

  async fillDtoByDetail(payload: any) {
    // add or update token to DB
    const tokenDetailReq: TokenDetailReqDto = {
      blockchainId: payload.blockchain,
      nodeId: payload.node,
      dexId: payload.dex,
      walletId: payload.mainWallet,
      tokenAddress: payload.tokenAddress
    };
    const token = await this.tokenService.addByDetail(tokenDetailReq);

    const autobotDto = {
      blockchain: payload.blockchain,
      dex: payload.dex,
      node: payload.node,
      mainWallet: payload.mainWallet,
      coin: payload.coin,
      token: token._id,
      buyAmount: payload.buyAmount,
      pool: payload.pool
    };

    return autobotDto;
  }
}