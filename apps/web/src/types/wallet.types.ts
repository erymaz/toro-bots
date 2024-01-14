import { IUser } from "./user.types";

export interface IWalletAddRequest {
  name: string;
  privateKey?: string;
  publicKey: string;
  users: string[];
}

export interface IWalletEditRequest extends IWalletAddRequest {
  _id: string;
}

export interface IWallet {
  _id: string;
  name: string;
  privateKey: string;
  publicKey: string;
  owner: IUser,
  users: IUser[];
  created?: Date;
  updated?: Date; 
}
