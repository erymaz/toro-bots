import { EventEmitter } from "events";
import WebSocket from "ws";

import config from "../config";
import { getMaxGasPriceByBlockchainName } from "../scan";
import {
  BlockchainClient, ERC20Token, UniswapDex,
  IStoredUser, IStoredVolumeBot, IStoredBlockchain, IStoredNode, IStoredDex, IStoredWallet, IStoredCoin, IStoredToken, ITransaction,
  ERunningStatus, ETradingThread, ETradingInitiator, EBotBuyType, EBotSellType, events,
  STATUS_READY, STATUS_SUCCESS, STATUS_ERROR,
  Logger, waitFor,
  Response, mongoDB, IAutoBotState, ISocketData, ESocketType, TransactionStatus, EVolumeBotStatus, IAddLiquiditySchedule, ISellingSchedule
} from "@torobot/shared";
import BigNumber from "bignumber.js";
import routerABI from "./uniswapV2Router";
import pairABI from "./uniswapV2Pair";
import factoryABI from "../scan/factory";
import * as web3Utils from "web3-utils";

export class VolumeBotClient extends EventEmitter {
  step = ETradingThread.AUTO_SENDING_COIN_TO_NEW_WALLET;
  tryCount: number = 0;
  processed: boolean = false;
  lock: boolean = false;
  currentBlockNumber: number = 0;

  lockedProcessAddLiquiditySchedule: boolean = false;
  lockedProcessSellingSchedule: boolean = false;
  lockedProcessAutoSellingSchedule: boolean = false;

  state: IAutoBotState = {
    active: false,
    status: ERunningStatus.DRAFT,
    thread: 'NONE'
  }
  logger: Logger;
  user: IStoredUser;
  bot: IStoredVolumeBot;
  blockchain: IStoredBlockchain;
  node: IStoredNode;
  dex: IStoredDex;
  wallet: IStoredWallet;
  coin: IStoredCoin;
  token: IStoredToken;

  coinAddress: string;
  tokenAddress: string;
  pairAddress: string;
  pairContract: any;
  factoryContract: any;
  routerContract: any;

  walletAddress: string;
  walletKey: string;

  blockchainClient: BlockchainClient;
  swapDex: UniswapDex;
  coinERC20: ERC20Token;
  tokenERC20: ERC20Token;

  private intervalID = null;
  private intervalIDForAddLiquidity = null;
  private intervalIDForSelling = null;
  private intervalIDForAutoSelling = null;
  private wsServer: WebSocket.Server;

  get logPrefix() {
    return `volumebotClient`;
  }

  constructor(bot: IStoredVolumeBot, wsServer: WebSocket.Server) {
    super();
    this.setMaxListeners(0);
    this.logger = new Logger(config.LOG_DIR_PATH + `/volumebot/${bot._id}.txt`);

    this.bot = bot;
    this.wsServer = wsServer;
  }

  async init() {
    this.user = this.bot.owner as IStoredUser;
    this.blockchain = this.bot.blockchain as IStoredBlockchain;
    this.node = this.bot.node as IStoredNode;
    this.dex = this.bot.dex as IStoredDex;
    this.wallet = this.bot.mainWallet as IStoredWallet;
    this.coin = this.bot.coin as IStoredCoin;
    this.token = this.bot.token as IStoredToken;
    this.coinAddress = this.coin.address;
    this.tokenAddress = this.token.address;

    this.blockchainClient = new BlockchainClient(this.blockchain, this.node, this.wallet as IStoredWallet, this.logger);
    this.swapDex = new UniswapDex(this.blockchainClient, this.dex, this.logger);
    this.coinERC20 = new ERC20Token(this.blockchainClient, this.coinAddress, this.logger);
    this.tokenERC20 = new ERC20Token(this.blockchainClient, this.tokenAddress, this.logger);

    await this.blockchainClient.init();
    await this.swapDex.init();
    await this.coinERC20.init();
    await this.tokenERC20.init();
    this.routerContract = new this.blockchainClient.rpcWeb3.eth.Contract(routerABI as web3Utils.AbiItem[], this.dex.routerAddress);
    this.factoryContract = new this.blockchainClient.rpcWeb3.eth.Contract(factoryABI as web3Utils.AbiItem[], this.dex.factoryAddress);
    this.pairAddress = await this.factoryContract.methods.getPair(this.coinAddress, this.tokenAddress).call();
    this.pairContract = new this.blockchainClient.rpcWeb3.eth.Contract(pairABI as web3Utils.AbiItem[], this.pairAddress);

    if (!this.bot.walletAddress && !this.bot.walletKey) {
      const newAccount = await this.blockchainClient.rpcWeb3.eth.accounts.create(new Date().toString());
      this.walletAddress = newAccount.address;
      this.walletKey = newAccount.privateKey;
      // save the new walletAddress and walletKey on Database.
      this.bot.walletAddress = this.walletAddress;
      this.bot.walletKey = this.walletKey;
      const botDoc = await mongoDB.VolumeBots.findById(this.bot._id);
      botDoc.walletAddress = this.walletAddress;
      botDoc.walletKey = this.walletKey;
      botDoc.save();
    } else {
      this.walletAddress = this.bot.walletAddress;
      this.walletKey = this.bot.walletKey;
    }

    this.logger.log(this.logPrefix, 'info', 'init');
  }

  async setBotStatus(st: EVolumeBotStatus) {
    let botDoc = await mongoDB.VolumeBots.findById(this.bot._id);
    botDoc.state = st;
    await botDoc.save();

    this.bot.state = st;

    const wsData = {
      type: ESocketType.VOLUME_BOT_STATUS,
      data: this.bot
    };

    this.wsServer.clients.forEach(client => {
      client.send(JSON.stringify(wsData));
    });
  }

  async updateLiquidities(index: number, status: EVolumeBotStatus, txHash?: string) {
    this.bot.addLiquiditySchedule[index].status = status;
    if (txHash) {
      this.bot.addLiquiditySchedule[index].txHash = txHash; 
    }

    let botDoc = await mongoDB.VolumeBots.findById(this.bot._id);
    botDoc.addLiquiditySchedule = this.bot.addLiquiditySchedule;
    await botDoc.save();

    const wsData = {
      type: ESocketType.VOLUME_BOT_STATUS,
      data: this.bot
    };

    this.wsServer.clients.forEach(client => {
      client.send(JSON.stringify(wsData));
    });
  }

  async updateSellings(index: number, status: EVolumeBotStatus, txHash?: string) {
    this.bot.sellingSchedule[index].status = status;
    if (txHash) {
      this.bot.sellingSchedule[index].txHash = txHash;
    }

    let botDoc = await mongoDB.VolumeBots.findById(this.bot._id);
    botDoc.sellingSchedule = this.bot.sellingSchedule;
    await botDoc.save();

    const wsData = {
      type: ESocketType.VOLUME_BOT_STATUS,
      data: this.bot
    };

    this.wsServer.clients.forEach(client => {
      client.send(JSON.stringify(wsData));
    });
  }

  async updateAutoSelling(txHash: string) {
    if (!this.bot.autoSellingTxHash) {
      this.bot.autoSellingTxHash = [];
    }
    this.bot.autoSellingTxHash.push(txHash);

    let botDoc = await mongoDB.VolumeBots.findById(this.bot._id);
    botDoc.autoSellingTxHash = this.bot.autoSellingTxHash;
    await botDoc.save();

    const wsData = {
      type: ESocketType.VOLUME_BOT_STATUS,
      data: this.bot
    };

    this.wsServer.clients.forEach(client => {
      client.send(JSON.stringify(wsData));
    });
  }

  async start() {
    this.processed = false;
    this.tryCount = 0;
    this.lock = false;
    this.lockedProcessAddLiquiditySchedule = false;
    this.lockedProcessSellingSchedule = false;
    this.lockedProcessAutoSellingSchedule = false;

    // Update the bot state in db
    await this.setBotStatus(EVolumeBotStatus.RUNNING);

    if (this.bot.addLiquiditySchedule) {
      if (this.bot.addLiquiditySchedule.length > 0) {
        this.intervalIDForAddLiquidity = setInterval(() => this.processAddLiquiditySchedule(), 1000);
      }
    }
    if (this.bot.sellingSchedule) {
      if (this.bot.sellingSchedule.length > 0) {
        this.intervalIDForSelling = setInterval(() => this.processSellingSchedule(), 1000);
      }
    }
    if (this.bot.isAutoSellingStrategy) {
      this.intervalIDForAutoSelling = setInterval(() => this.processAutoSellingSchedule(), 1000);
    }

  }

  async stop() {
    this.processed = true;
    // Update the bot state in db
    await this.setBotStatus(EVolumeBotStatus.FAILED);

    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
    if (this.intervalIDForAddLiquidity) {
      clearInterval(this.intervalIDForAddLiquidity);
    }
    if (this.intervalIDForSelling) {
      clearInterval(this.intervalIDForSelling);
    }
    if (this.intervalIDForAutoSelling) {
      clearInterval(this.intervalIDForAutoSelling);
    }
  }

  async getTxInfoByTxHash(transactionHash: string, isBuying: boolean = true) {
    const qRes = await this.blockchainClient.getTransactionReceipt(transactionHash);
    let amountOut = new BigNumber(0);
    if (qRes.logs) {
      for (const log of qRes.logs) {
        if (log.topics) {
          if (log.topics.length === 3) {
            // Get pair contract address
            const pairContractAddress = await this.swapDex.factoryContract.methods.getPair(this.coinAddress, this.tokenAddress).call();
            if (pairContractAddress) {
              // Transfer
              if (log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
                pairContractAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1 &&
                this.walletAddress.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1
              ) {
                if (isBuying) {
                  amountOut = new BigNumber(log.data).shiftedBy(-this.tokenERC20.decimals);
                } else {
                  amountOut = new BigNumber(log.data).shiftedBy(-this.coinERC20.decimals);
                }
                break;
              }
            }
          }
        }
      }
    }

    return amountOut
  }

  async processAddLiquiditySchedule() {
    console.log("-------------  add liquidity  -------------->");
    const gasPrice = new BigNumber(getMaxGasPriceByBlockchainName(this.blockchain.name)).shiftedBy(9).toString();
    if (this.lockedProcessAddLiquiditySchedule) {
      return;
    }
    this.lockedProcessAddLiquiditySchedule = true;
    for (let i = 0; i < this.bot.addLiquiditySchedule.length; i++) {
      if (this.bot.addLiquiditySchedule[i].status === EVolumeBotStatus.NONE) {
        let st = new Date(this.bot.addLiquiditySchedule[i].time+"-0800").getTime();
        let ct = new Date().getTime();
        console.log("-------------  add liquidity  -------------->", st, ct);
        // 
        if (ct > st && (ct - st < 600000)) {
          // update the liquidity schedule status
          await this.updateLiquidities(i, EVolumeBotStatus.RUNNING);

          // 1. coin approving
          let amountCoin = this.bot.addLiquiditySchedule[i].baseCoin;
          console.log("#####->", amountCoin);
          let tryCount = 0;
          while (tryCount < 5) {
            try {
              const txCall = this.coinERC20.approve(this.dex.routerAddress, new BigNumber(amountCoin));
              const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
                this.wallet.publicKey,
                this.wallet.privateKey,
                this.coinERC20.address,
                txCall,
                0,
                gasPrice
              );
              if (txRes.status === STATUS_SUCCESS) {
                this.logger.log(this.logPrefix, 'info', `coin approving-for add liquidity: transactionHash(${txRes.data.transactionHash})`);
                tryCount = 0;
                break;
              }
            } catch (e) {
              console.log("failed: coin approving  ---> ", tryCount)
            }
            await waitFor(6000);
            tryCount++;
          }
          if (tryCount > 0) {
            // failed
            await this.updateLiquidities(i, EVolumeBotStatus.FAILED);
            this.lockedProcessAddLiquiditySchedule = false;
            console.log("failed: coin approving !!!!")
            return;
          }
          // 2. token approving
          const reserves = await this.pairContract.methods.getReserves().call();
          console.log("reserves: ====>", reserves);
          const price = Number(this.coinAddress) < Number(this.tokenAddress) ?
            new BigNumber(reserves._reserve1).shiftedBy(-this.tokenERC20.decimals).dividedBy(new BigNumber(reserves._reserve0).shiftedBy(-this.coinERC20.decimals))
            : new BigNumber(reserves._reserve0).shiftedBy(-this.tokenERC20.decimals).dividedBy(new BigNumber(reserves._reserve1).shiftedBy(-this.coinERC20.decimals));
          const amountToken = price.multipliedBy(amountCoin).toNumber();
          console.log("price, amountToken: ", price, amountToken);
          while (tryCount < 5) {
            try {
              const txCall = this.tokenERC20.approve(this.dex.routerAddress, new BigNumber(amountToken));
              const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
                this.wallet.publicKey,
                this.wallet.privateKey,
                this.tokenERC20.address,
                txCall,
                0,
                gasPrice
              );
              if (txRes.status === STATUS_SUCCESS) {
                this.logger.log(this.logPrefix, 'info', `token approving-for add liquidity: transactionHash(${txRes.data.transactionHash})`);
                tryCount = 0;
                break;
              }
            } catch (e) {
              console.log("failed: token approving", tryCount)
            }
            await waitFor(6000);
            tryCount++;
          }
          if (tryCount > 0) {
            // failed
            await this.updateLiquidities(i, EVolumeBotStatus.FAILED);
            this.lockedProcessAddLiquiditySchedule = false;
            console.log("failed -> token approving !!!!!!");
            return;
          }

          while (tryCount < 5) {
            // 3. add Liquidity
            try {
              const txCall = this.routerContract.methods.addLiquidity(
                Number(this.coinAddress) < Number(this.tokenAddress) ? this.coinAddress : this.tokenAddress,  // tokenA
                Number(this.coinAddress) < Number(this.tokenAddress) ? this.tokenAddress : this.coinAddress,  // tokenB
                Number(this.coinAddress) < Number(this.tokenAddress) ?
                  new BigNumber(amountCoin).shiftedBy(this.coinERC20.decimals).toString()
                  : new BigNumber(amountToken).shiftedBy(this.tokenERC20.decimals).toString(),     //amountADesired
                Number(this.coinAddress) < Number(this.tokenAddress) ?
                  new BigNumber(amountToken).shiftedBy(this.tokenERC20.decimals).toString()
                  : new BigNumber(amountCoin).shiftedBy(this.coinERC20.decimals).toString(),     //amountBDesired
                0,
                0,
                this.wallet.publicKey,
                Date.now() + 1000 * 60 * 5
              );
              const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
                this.wallet.publicKey,
                this.wallet.privateKey,
                this.dex.routerAddress,
                txCall,
                0,
                gasPrice
              );
              if (txRes.status === STATUS_SUCCESS) {
                this.logger.log(this.logPrefix, 'info', `add liquidity: transactionHash(${txRes.data.transactionHash})`);
                tryCount = 0;
                this.bot.addLiquiditySchedule[i].token = amountToken;
                this.bot.addLiquiditySchedule[i].tokenPrice = amountCoin / amountToken;
                await this.updateLiquidities(i, EVolumeBotStatus.SUCCESS, txRes.data.transactionHash);
                break;
              }
            } catch (e) {
              console.log("failed: add liduitidy ------>", tryCount)
            }
            await waitFor(6000);
            tryCount++;
          }
          if (tryCount > 0) {
            await this.updateLiquidities(i, EVolumeBotStatus.FAILED);
            this.lockedProcessAddLiquiditySchedule = false;
            console.log("failed: add liduitidy !!!!");
            return;
          }
        }
        break;
      }
    }
    this.lockedProcessAddLiquiditySchedule = false;
  }

  async processSellingSchedule() {
    const gasPrice = new BigNumber(getMaxGasPriceByBlockchainName(this.blockchain.name)).shiftedBy(9).toString();
    if (this.lockedProcessSellingSchedule) {
      return;
    }
    this.lockedProcessSellingSchedule = true;
    for (let i = 0; i < this.bot.sellingSchedule.length; i++) {
      if (this.bot.sellingSchedule[i].status === "-") {
        let st = new Date(this.bot.sellingSchedule[i].time+"-0800").getTime();
        let ct = new Date().getTime();
        console.log("st, ct: ------>", st, ct, new Date(this.bot.sellingSchedule[i].time+"-0800"), new Date());
        if (ct > st && (ct - st < 600000)) {
          // update selling schedule status
          await this.updateSellings(i, EVolumeBotStatus.RUNNING);

          let tryCount = 0;
          // 1. token approving
          let amountToken = this.bot.sellingSchedule[i].token;
          while (tryCount < 5) {
            try {
              const txCall = this.tokenERC20.approve(this.dex.routerAddress, new BigNumber(amountToken));
              const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
                this.wallet.publicKey,
                this.wallet.privateKey,
                this.tokenERC20.address,
                txCall,
                0,
                gasPrice
              );
              if (txRes.status === STATUS_SUCCESS) {
                this.logger.log(this.logPrefix, 'info', `token approving-for selling schedule: transactionHash(${txRes.data.transactionHash})`);
                tryCount = 0;
                break;
              }
            } catch (e) {
              console.log("failed: token approving", tryCount)
            }
            await waitFor(6000);
            tryCount++;
          }
          if (tryCount > 0) {
            // failed
            await this.updateSellings(i, EVolumeBotStatus.FAILED);
            this.lockedProcessSellingSchedule = false;
            console.log("failed -> token approving !!!!!!");
            return;
          }

          // 2. selling token
          let sellAmount = this.bot.sellingSchedule[i].token;
          while (tryCount < 5) {
            try {
              const txCall = await this.swapDex.sellToken(
                this.tokenAddress, 
                this.coinAddress, 
                new BigNumber(sellAmount).shiftedBy(this.tokenERC20.decimals).toString(), 
                this.wallet.publicKey
              );
              const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
                this.wallet.publicKey,
                this.wallet.privateKey,
                this.dex.routerAddress,
                txCall,
                0,
                gasPrice
              );
              if (txRes.status === STATUS_SUCCESS) {
                this.logger.log(this.logPrefix, 'info', `selling schedule: transactionHash(${txRes.data.transactionHash})`);
                console.log("------------>", txRes);
                const qRes = await this.blockchainClient.getTransactionReceipt(txRes.data.transactionHash);
                let amountOut = new BigNumber(0);
                if (qRes.logs) {
                  for (const log of qRes.logs) {
                    if (log.topics) {
                      if (log.topics.length === 3) {
                        // Get pair contract address
                        const pairContractAddress = await this.swapDex.factoryContract.methods.getPair(this.coinAddress, this.tokenAddress).call();
                        if (pairContractAddress) {
                          // Transfer
                          if (log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
                            pairContractAddress.toLowerCase().indexOf(log.topics[1].substr(-40)) > -1 &&
                            this.wallet.publicKey.toLowerCase().indexOf(log.topics[2].substr(-40)) > -1
                          ) {
                            amountOut = new BigNumber(log.data).shiftedBy(-this.coinERC20.decimals);
                            break;
                          }
                        }
                      }
                    }
                  }
                }
                this.bot.sellingSchedule[i].earnedCoin = amountOut.toNumber();
                this.bot.sellingSchedule[i].tokenPrice = amountOut.dividedBy(sellAmount).toNumber();
                tryCount = 0;
                await this.updateSellings(i, EVolumeBotStatus.SUCCESS, txRes.data.transactionHash);
                break;
              }
            } catch (e) {
              console.log("failed: selling token");
            }
            tryCount++;
          }
          if (tryCount > 0) {
            await this.updateSellings(i, EVolumeBotStatus.FAILED);
            this.lockedProcessSellingSchedule = false;
            console.log("failed: selling token !!!!");
          }
        }
      }
    }
    this.lockedProcessSellingSchedule = false;
  }

  async processAutoSellingSchedule() {
    console.log("Start process Auto Selling Schedule !!!");
    if (this.lockedProcessAutoSellingSchedule) {
      return;
    }
    this.lockedProcessAutoSellingSchedule = true;
    let _currentBlockNumber = await this.blockchainClient.rpcWeb3.eth.getBlockNumber();
    console.log("oldBlockNumber, currentBlockNumber: --------------->", this.currentBlockNumber, _currentBlockNumber);
    if (this.currentBlockNumber === 0) {
      this.currentBlockNumber = _currentBlockNumber;
      this.lockedProcessAutoSellingSchedule = false;
      return;
    }
    if (_currentBlockNumber > this.currentBlockNumber) {
      const _events = await this.pairContract.getPastEvents('Swap', { fromBlock: this.currentBlockNumber + 1, toBlock: _currentBlockNumber });
      // const _events = await this.pairContract.getPastEvents('Swap', { fromBlock: 15147090, toBlock: 15147100 });
      console.log(_events);
      for (const _event of _events) {
        let coinAmount = 0;
        let tokenAmount = 0;
        if (Number(this.coinAddress) < Number(this.tokenAddress)) {
          if (_event.returnValues.amount1In === '0') {
            coinAmount = new BigNumber(_event.returnValues.amount0In).shiftedBy(-this.coinERC20.decimals).toNumber();
            tokenAmount = _event.returnValues.amount1Out;
          }
        } else {
          if (_event.returnValues.amount0In === '0') {
            coinAmount = new BigNumber(_event.returnValues.amount1In).shiftedBy(-this.coinERC20.decimals).toNumber();
            tokenAmount = _event.returnValues.amount0Out;
          }
        }
        const gasPrice = new BigNumber(getMaxGasPriceByBlockchainName(this.blockchain.name)).shiftedBy(9).toString();
        console.log("gasPrice =============>", gasPrice);
        if (coinAmount >= this.bot.alertAmountForPurchase) {
          let sellAmount: string = new BigNumber(tokenAmount).multipliedBy(Number(this.bot.percentForAutoSelling)).shiftedBy(-2).toFixed(0);
          console.log("tokenAmount, percentForAutoSelling) ==> ", sellAmount, tokenAmount, this.bot.percentForAutoSelling);
          let tryCount = 0;
          // 1. token approving
          while (tryCount < 5) {
            try {
              const txCall = this.tokenERC20.approve(this.dex.routerAddress, new BigNumber(sellAmount).shiftedBy(-this.tokenERC20.decimals));
              const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
                this.wallet.publicKey,
                this.wallet.privateKey,
                this.tokenERC20.address,
                txCall,
                0,
                gasPrice
              );
              if (txRes.status === STATUS_SUCCESS) {
                this.logger.log(this.logPrefix, 'info', `token approving-for auto selling: transactionHash(${txRes.data.transactionHash})`);
                tryCount = 0;
                break;
              }
            } catch (e) {
              console.log("failed: token approving", tryCount)
            }
            await waitFor(3000);
            tryCount++;
          }
          if (tryCount > 0) {
            // failed
            this.lockedProcessAutoSellingSchedule = false;
            console.log("failed -> token approving !!!!!!");
            this.currentBlockNumber = _currentBlockNumber;
            return;
          }
          await waitFor(6000);
          // 2. selling token
          while (tryCount < 5) {
            try {
              const txCall = await this.swapDex.sellToken(
                this.tokenAddress, 
                this.coinAddress, 
                sellAmount,
                this.wallet.publicKey
              );
              const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
                this.wallet.publicKey,
                this.wallet.privateKey,
                this.dex.routerAddress,
                txCall,
                0,
                gasPrice
              );
              if (txRes.status === STATUS_SUCCESS) {
                this.logger.log(this.logPrefix, 'info', `pre selling: transactionHash(${txRes.data.transactionHash})`);
                await this.updateAutoSelling(txRes.data.transactionHash);
                tryCount = 0;
                break;
              }
            } catch (e) {
              console.log("failed: auto selling token");
            }
            tryCount++;
          }
          if (tryCount > 0) {
            console.log("failed: auto selling token !!!!!!!!")
          } else {
            console.log("success: auto selling token !!!!!!!")
            break;
          }
        }
      }
      this.currentBlockNumber = _currentBlockNumber;
    }

    this.lockedProcessAutoSellingSchedule = false;
  }

  async withdraw() {
    const gasPrice = new BigNumber(getMaxGasPriceByBlockchainName(this.blockchain.name)).shiftedBy(9).toString();
    console.log("=============================================================>", gasPrice)
    // transfer from sub wallet to main wallet
    // get base coin balance
    const baseCoinBalance = await this.coinERC20.contract.methods.balanceOf(this.walletAddress).call();
    console.log("baseCoinBalance=============================================================>", baseCoinBalance)
    let i = 0;
    while (i < 10 && baseCoinBalance > 0) {
      try {
        const txCall = this.coinERC20.transfer(this.wallet.publicKey, new BigNumber(baseCoinBalance).shiftedBy(-this.coinERC20.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.coinERC20.address,
          txCall,
          0,
          gasPrice
        );
        console.log("withdraw step1: ", txRes);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `sending: transactionHash(${txRes.data.transactionHash})`);
          await waitFor(3000);
          break;
        }
      } catch (e) {
        console.warn("step1: ", e);
      }
      i++;
    }
    if (i >= 10) {
      return false;
    }
    // get token balance
    const tokenBalance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();
    console.log("tokenBalance=============================================================>", tokenBalance)
    i = 0;
    while (i < 10 && tokenBalance > 0) {
      try {
        const txCall = this.tokenERC20.transfer(this.wallet.publicKey, new BigNumber(tokenBalance).shiftedBy(-this.tokenERC20.decimals));
        const txRes: Response = await this.blockchainClient.sendSignedTransactionByPrivateKey(
          this.walletAddress,
          this.walletKey,
          this.tokenERC20.address,
          txCall,
          0,
          gasPrice
        );
        console.log("-------------->withdraw step2: ", txRes);
        if (txRes.status === STATUS_SUCCESS) {
          this.logger.log(this.logPrefix, 'info', `sending: transactionHash(${txRes.data.transactionHash})`);
          await waitFor(3000);
          break;
        }
      } catch (e) {
        console.warn("step2: ", e);
      }
      i++;
    }
    // if (i >= 10) {
    //   return false;
    // }
    // get main coin balance
    await waitFor(2000);
    const mainCoinBalance = new BigNumber(await this.blockchainClient.rpcWeb3.eth.getBalance(this.walletAddress));
    console.log("mainCoinBalance===================================>", mainCoinBalance.toString(), gasPrice, Number(gasPrice) * 21000);
    i = 0;
    while (i < 10 && mainCoinBalance.isGreaterThan(0)) {
      try {
        const tx = await this.blockchainClient.rpcWeb3.eth.accounts.signTransaction(
          {
            to: this.wallet.publicKey,
            value: mainCoinBalance.minus(new BigNumber(gasPrice).multipliedBy(21000)).toNumber(),
            gas: 21000,
            gasPrice: gasPrice
          },
          this.walletKey
        );
        if (tx && tx?.rawTransaction) {
          const sendResult = await this.blockchainClient.rpcWeb3.eth.sendSignedTransaction(tx.rawTransaction);
          if (sendResult && sendResult?.status) {
            break;
          }
        }
      } catch (e) {
        console.warn("withdraw step2: ", e);
      }
      i++;
    }
    if (i >= 10) {
      return false;
    }

    await this.getSubWalletInfo();
    return true;
  }

  async getSubWalletInfo() {
    const mainCoinBalance = await this.blockchainClient.rpcWeb3.eth.getBalance(this.walletAddress);
    const baseCoinBalance = await this.coinERC20.contract.methods.balanceOf(this.walletAddress).call();
    const tokenBalance = await this.tokenERC20.contract.methods.balanceOf(this.walletAddress).call();

    const retVal = {
      mainCoinBalance: new BigNumber(mainCoinBalance).shiftedBy(-18).toNumber(),
      baseCoinBalance: new BigNumber(baseCoinBalance).shiftedBy(-this.coinERC20.decimals).toNumber(),
      tokenBalance: new BigNumber(tokenBalance).shiftedBy(-this.tokenERC20.decimals).toNumber(),
    };

    const wsData = {
      type: ESocketType.AUTO_BOT_SUB_WALLET_INFO,
      data: {
        botId: this.bot._id,
        walletInfo: retVal
      }
    };

    this.wsServer.clients.forEach(client => {
      client.send(JSON.stringify(wsData));
    });

    return retVal;
  }
}
