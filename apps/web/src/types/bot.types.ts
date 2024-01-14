import { 
  IUser, IBlockchain, IDex, INode, IWallet, ICoin, IToken, 
  ETradingInitiator, TransactionStatus
} from ".";
import { ETradingThread, ERunningStatus} from "./shared.types"

export enum EBotType {
  NONE = "NONE",
  BUY = "BUY",
  SELL = "SELL",
  BUY_SELL = "BUY_SELL"
}

export enum EBotBuyType {
  SPAM = "SPAM",
  EVENT = "EVENT",
  ONCE = "ONCE"
}

export enum EBotSellType {
  TIMER = "TIMER",
  SPAM = "SPAM",
  ONCE = "ONCE"
}

export interface IBotState {
  active: boolean;
  status: ERunningStatus;
  thread: ETradingThread;
  result: string;
  extends?: {
    stopLoss?: IBotState,
    instant?: IBotState
  }
}

export interface IBotBuy {
  type: EBotBuyType;
  amount: number;
  startTime?: Date;
  // interval: number;
  period: number;
  gasPrice?: number;
}

export interface IBotSellItem {
  amount: number;
  deltaTime: number;
}

export interface IBotSell {
  type: EBotSellType;
  amount?: number;
  // startTime?: Date;
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

export interface IBotStatistics {
  coinAmount: number;
  tokenAmount: number;
  fee: number;
}

export interface IBotAddRequest {
  blockchain: string;
  dex: string;
  node: string;
  wallet: string;
  coin: string;
  tokenAddress: string;
  initiator?: ETradingInitiator;
  type: EBotType
  buy: IBotBuy | {};
  sell: IBotSell | {};
  config?: IBotConfig | {};
}

export interface IBotUpdateRequest {
  _id: string;
  blockchain?: string;
  dex?: string;
  node?: string;
  wallet?: string;
  coin?: string;
  tokenAddress?: string;
  type?: EBotType
  buy?: IBotBuy | {};
  sell?: IBotSell | {};
  config?: IBotConfig | {};
  state?: IBotState;
}

export interface IBot {
  _id: string;
  uniqueNum?: number;
  blockchain: IBlockchain;
  dex: IDex;
  node: INode;
  wallet: IWallet;
  coin: ICoin;
  token: IToken;
  initiator?: ETradingInitiator;
  type: EBotType;
  buy?: IBotBuy;
  sell?: IBotSell;
  config?: IBotConfig;
  statistics?: {
    buy?: IBotStatistics,
    sell?: IBotStatistics,
  };
  state: IBotState;
  owner: IUser;
  created?: Date;
  updated?: Date;  
}

export interface IBotTradingRequest {
  botId: string;
  active: boolean;
  type?: EBotType;
  thread?: ETradingThread;
  data?: IBotBuy | IBotSell;
}

export interface IBotStatus {
  _id: string;
  state: IBotState;
}

export interface IBotHistory {
  user: IUser;
  wallet: IWallet;
  blockchain: IBlockchain;
  dex?: IDex;
  bot?: IBot;
  coin?: ICoin;
  token?: IToken;
  initiator: ETradingInitiator;
  thread: ETradingThread;
  result: TransactionStatus;
  tryCount?: number;
  txHash?: string;
  gasFee?: number;
  coinAmount?: number;
  tokenAmount?: number;
  message?: string;
  created?: Date;
}

export interface IAutoBotState {
  active: boolean;
  status: ERunningStatus;
  thread?: string;
}

export interface IAutoBotAddRequest {
  blockchain: string;
  dex: string;
  node: string;
  mainWallet: string;
  coin: string;
  tokenAddress: string;
  buyAmount: number;
  pool?: string;
  state?: IAutoBotState
}

export interface IAutoBot {
  _id: string;
  uniqueNum?: number;
  blockchain: IBlockchain;
  dex: IDex;
  node: INode;
  mainWallet: IWallet;
  coin: ICoin;
  token: IToken;
  initiator?: ETradingInitiator;
  buyAmount: number;
  walletAddress: string;
  walletKey: string;
  statistics?: {
    buy?: IBotStatistics,
    sell?: IBotStatistics,
  };
  state: IAutoBotState;
  step: ETradingThread;
  owner: IUser;
  created?: Date;
  updated?: Date;  
}

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

export interface IVolumeBotAddRequest {
  blockchain: string;
  dex: string;
  node: string;
  mainWallet: string;
  coin: string;
  token: string;
  addLiquiditySchedule?: IAddLiquiditySchedule[];
  sellingSchedule?: ISellingSchedule[];
  isAutoSellingStrategy: boolean;
  alertAmountForPurchase: number;
  percentForAutoSelling: number;
}

export enum EVolumeBotStatus {
  NONE = "-",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export interface IVolumeBot {
  _id: string;
  uniqueNum?: number;
  blockchain: IBlockchain;
  dex: IDex;
  node: INode;
  mainWallet: IWallet;
  coin: ICoin;
  token: IToken;
  addLiquiditySchedule: IAddLiquiditySchedule[];
  sellingSchedule: ISellingSchedule[];
  isAutoSellingStrategy: boolean;
  autoSellingTxHash?: string[];
  alertAmountForPurchase: number;
  percentForAutoSelling: number;
  owner: IUser;
  state: EVolumeBotStatus;
  created?: Date;
  updated?: Date;
}
