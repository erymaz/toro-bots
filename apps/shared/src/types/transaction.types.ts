import { Stored, IStoredUser, IStoredWallet, IStoredBlockchain, IStoredNode, IStoredDex, IStoredBot, IStoredCoin, IStoredToken, ETradingInitiator, ETradingThread, TransactionStatus } from "."

export interface ITransaction {
  user: string | IStoredUser;
  wallet: string | IStoredWallet;
  blockchain: string | IStoredBlockchain;
  node?: string | IStoredNode;
  dex?: string | IStoredDex;
  bot?: string | IStoredBot;
  coin?: string | IStoredCoin;
  token?: string | IStoredToken;
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
export type IStoredTransaction = Stored<ITransaction>