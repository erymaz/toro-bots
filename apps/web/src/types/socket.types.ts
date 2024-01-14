export enum ESocketType {
  CHAIN_MAX_GAS_PRICE = "CHAIN_MAX_GAS_PRICE",
  AUTO_BOT_START_REQ = "AUTO_BOT_START_REQ",
  AUTO_BOT_STOP_REQ = "AUTO_BOT_STOP_REQ",
  AUTO_BOT_STATE = "AUTO_BOT_STATE",
  NEW_TOKEN_DROPPED = "NEW_TOKEN_DROPPED",
  AUTO_BOT_WITHDRAW = "AUTO_BOT_WITHDRAW",
  AUTO_BOT_SUB_WALLET_INFO = "AUTO_BOT_SUB_WALLET_INFO",
  VOLUME_BOT_START_REQ = "VOLUME_BOT_START_REQ",
  VOLUME_BOT_STOP_REQ = "VOLUME_BOT_STOP_REQ",
  VOLUME_BOT_STATUS = "VOLUME_BOT_STATUS"
}

export interface IChainMaxGasPrice {
  blockchainId: string;
  maxGasPrice: number;
}

export interface ISocketAutoBotState {
  botId: string;
  state: string;
}

export interface ISocketData {
  type: ESocketType,
  data: any
}
