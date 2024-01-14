import { IBlockchain, INode, IBot, ICoin, IDex, IToken, IUser, IWallet, ETradingInitiator, ETradingThread, TransactionStatus } from ".";

export interface ITransaction {
  user: IUser;
  wallet: IWallet;
  blockchain: IBlockchain;
  node?: INode;
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

export interface ITransactionHistory {
  _id: string;
  user: IUser;
  wallet: IWallet;
  blockchain: IBlockchain;
  node?: INode;
  dex: IDex;
  bot: IBot;
  coin: ICoin;
  token: IToken;
  initiator: ETradingInitiator;
  transactions: ITransaction[];
}
