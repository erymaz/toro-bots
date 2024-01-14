import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import * as fs from 'fs';
import config from "../../../config";
import { VolumeBotDto } from '../dto/volumebot.dto';
import {
  mongoDB,
  IVolumeBotDocument,
  IUserDocument
} from "@torobot/shared";
import { TokenService } from '../../token/service/token.service';
import { TransactionService } from '../../transaction/service/transaction.service';
import { TokenDetailReqDto } from '../../token/dto/token.dto';

@Injectable()
export class VolumeBotService {
  constructor(
    private tokenService: TokenService,
    private transactionService: TransactionService,
  ) {}
  
  async create(bot: VolumeBotDto, user: IUserDocument) {
    const object = await mongoDB.VolumeBots.create({...bot, owner: user._id});
    return this.getById(object._id);
  }

  async getById(botId: string) {
    const doc = await mongoDB.VolumeBots.populateModel(mongoDB.VolumeBots.findById(botId));
    return doc as IVolumeBotDocument;
  }

  async update(bot: IVolumeBotDocument, body: UpdateQuery<IVolumeBotDocument>) {
    await mongoDB.VolumeBots.findOneAndUpdate({_id: bot._id}, body);
    return this.getById(bot._id);
  }

  delete(bot: IVolumeBotDocument) {
    return mongoDB.VolumeBots.findOneAndDelete({ _id: bot._id });
  }

  async validate(botId: string): Promise<IVolumeBotDocument> {
    const doc = await this.getById(botId);

    if (!doc) {
      throw new NotFoundException('VolumeBot not found');
    }

    return doc as IVolumeBotDocument;
  }

  async getAll() {
    return mongoDB.VolumeBots.populateModel(mongoDB.VolumeBots.find({}).sort({created: -1}));
  }

  async getLog(botId: string) {
    try {
      const log = fs.readFileSync(config.LOG_DIR_PATH + `/volumebot/${botId}.txt`, {
        encoding: "utf8"
      })
      return log;
    } catch (e) {
      return "";
    }
  }

  // async getHistory(botId: string) {
  //   try {
  //     const transactions = await this.transactionService.getsByVolumeBotId(botId);
  //     return transactions;
  //   } catch (e) {
  //     return [];
  //   }
  // }

  async fillDtoByDetail(payload: any) {
    console.log("==========>", payload);
    const tokenDetailReq: TokenDetailReqDto = {
      blockchainId: payload.blockchain,
      nodeId: payload.node,
      dexId: payload.dex,
      walletId: payload.mainWallet,
      tokenAddress: payload.token
    };
    const token = await this.tokenService.addByDetail(tokenDetailReq);

    const volumebotDto = {
      blockchain: payload.blockchain,
      dex: payload.dex,
      node: payload.node,
      mainWallet: payload.mainWallet,
      coin: payload.coin,
      token: token._id,
      addLiquiditySchedule: payload.addLiquiditySchedule,
      sellingSchedule: payload.sellingSchedule,
      isAutoSellingStrategy: payload.isAutoSellingStrategy,
      alertAmountForPurchase: payload.alertAmountForPurchase,
      percentForAutoSelling: payload.percentForAutoSelling
    };

    return volumebotDto;
  }
}