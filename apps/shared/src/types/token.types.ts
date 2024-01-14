import { Stored, IStoredBlockchain } from "."

export interface IToken {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: number;
  blockchain?: string | IStoredBlockchain;
  createdAt?: Date;
  balance?: number;
  created?: Date;
  updated?: Date;
}
export type IStoredToken = Stored<IToken>
