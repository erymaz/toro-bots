import { Stored, IStoredUser } from "."

export interface IWallet {
  name: string;
  privateKey: string;
  publicKey: string;
  owner: string | IStoredUser;
  users: (string | IStoredUser)[];
  created?: Date;
  updated?: Date;
}
export type IStoredWallet = Stored<IWallet>