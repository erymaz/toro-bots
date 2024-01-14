import { 
  Stored, IStoredUser, IStoredBlockchain, IStoredDex, IStoredNode, IStoredWallet, IStoredToken, IStoredCoin, 
  ERunningStatus, ETradingThread, ETradingInitiator } from "."

export enum EBotType {
  NONE = "NONE",
  BUY = "BUY",
  SELL = "SELL",
  BUY_SELL = "BUY_SELL"
}

export enum EBotBuyType {
  ONCE = "ONCE",
  SPAM = "SPAM",
  EVENT = "EVENT"
}

export enum EBotSellType {
  ONCE = "ONCE",
  SPAM = "SPAM",
  TIMER = "TIMER"
}

export interface IBotBuy {
  active: boolean;
  type: EBotBuyType;
  amount: number;
  slippage: number;
  estTime: Date;
  startTime: Date;
  period: number;
  gasPrice: number;
}

export interface IBotSellItem {
  amount: number;
  deltaTime: number;
}
export interface IBotSell {
  active: boolean;
  type: EBotSellType;
  amount?: string;
  count: number;
  step: number;
  items: IBotSellItem[];
  interval: number;
  gasPrice: number;
}

export interface IBotConfig {
  stopLimit: number;
  stopLoss: boolean;
  saveLimit: number;
  savings: boolean;
  rugpool: boolean;
  antiSell: boolean;
  buyLimitDetected: boolean;
  sellLimitDetected: boolean;
  autoBuyAmount: boolean;
  buyAnyCost: boolean;
}

export interface IBotState {
  active?: boolean;
  status?: ERunningStatus;
  thread?: ETradingThread;
  result?: string;
  extends?: {
    stopLoss?: IBotState;
    instant?: IBotState;
  }
}

export interface IBotStatisticsItem {
  coinAmount: number;
  tokenAmount: number;
  fee: number;
}
export interface IBotStatistics {
  buy?: IBotStatisticsItem;
  sell?: IBotStatisticsItem;
}

export interface IBotRugpool {
  lastBlock: number;
  firstMintedCoin: number;
  firstMintedToken: number;
  maxAccumulatedCoin: number;
  maxAccumulatedToken: number;
  currentAccumulatedCoin: number;
  currentAccumulatedToken: number;
}
export interface IBot {
  uniqueNum?: number;
  wallet: string | IStoredWallet;
  blockchain: string | IStoredBlockchain;
  dex: string | IStoredDex;
  node: string | IStoredNode;
  coin: string | IStoredCoin;
  token: string | IStoredToken;
  initiator?: ETradingInitiator;
  type?: EBotType;
  buy?: IBotBuy;
  sell?: IBotSell;
  config?: IBotConfig;
  statistics?: IBotStatistics;
  rugpool?: IBotRugpool;
  state: IBotState;  
  owner: string | IStoredUser;
  created?: Date;
  updated?: Date;  
}
export type IStoredBot = Stored<IBot>

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
export class BotTradingDto {
  botId: string;
  active: boolean;
  type?: EBotType;
  thread?: ETradingThread;
  data?: IBotBuy | IBotSell;
}

export class AutoBotTradingDto {
  botId: string;
}

export interface IAutoBotState {
  active: boolean;
  status: ERunningStatus;
  thread?: string;
}

export interface IAutoBot {
  uniqueNum?: number;
  blockchain: string | IStoredBlockchain;
  dex: string | IStoredDex;
  node: string | IStoredNode;
  mainWallet: string | IStoredWallet;
  coin: string | IStoredCoin;
  token: string | IStoredToken;
  initiator?: ETradingInitiator;
  buyAmount: number;
  walletAddress: string;
  walletKey: string;
  statistics?: IBotStatistics;
  state: IAutoBotState;
  step: ETradingThread;
  owner: string | IStoredUser;
  created?: Date;
  updated?: Date;  
}

export type IStoredAutoBot = Stored<IAutoBot>

export interface IAddLiquiditySchedule {
  time: Date;
  baseCoin: number;
  token?: number;
  tokenPrice?: number;
  txHash?: string;
  status: string;
}

export interface ISellingSchedule {
  time: Date;
  token: number;
  earnedCoin?: number;
  tokenPrice?: number;
  txHash?: string;
  status: string;
}

export enum EVolumeBotStatus {
  NONE = "-",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export interface IVolumeBot {
  uniqueNum?: number;
  blockchain: string | IStoredBlockchain;
  dex: string | IStoredDex;
  node: string | IStoredNode;
  mainWallet: string | IStoredWallet;
  coin: string | IStoredCoin;
  token: string | IStoredToken;
  walletAddress: string;
  walletKey: string;
  addLiquiditySchedule?: IAddLiquiditySchedule[];
  sellingSchedule?: ISellingSchedule[];
  isAutoSellingStrategy: boolean;
  autoSellingTxHash?: string[];
  alertAmountForPurchase: number;
  percentForAutoSelling: number;
  owner: string | IStoredUser;
  state: EVolumeBotStatus;
  created?: Date;
  updated?: Date;
}

export type IStoredVolumeBot = Stored<IVolumeBot>