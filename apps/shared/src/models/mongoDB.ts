import Mongoose from "mongoose";
import { Users, Wallets, Blockchains, Nodes, Dexes, Coins, Tokens, Bots, Transactions, Pools, AutoBots, VolumeBots } from "../models";
import { Logger } from "../utils";

export async function connectMongoDB(uri: string, logger?: Logger) {
  await Mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  } as Mongoose.ConnectionOptions);

  Mongoose.set('useNewUrlParser', true);
  Mongoose.set('useFindAndModify', false);
  Mongoose.set('useCreateIndex', true);
  Mongoose.set('useUnifiedTopology', true);

  Mongoose.connection.once("open", () => {
    console.log("connected to mongo at", uri);
    // if (logger) {
    //   logger.log('mongoDB', 'info', `connected to mongo at ${uri}`);
    // } else {
    //   console.log("connected to mongo at", uri);
    // }
  });  
}

export const mongoDB = {
  Users, Wallets, Blockchains, Nodes, Dexes, Coins, Tokens, Bots, Transactions, Pools, AutoBots, VolumeBots
};
