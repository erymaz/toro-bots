import { IStoredBlockchain, IStoredDex, IStoredNode, mongoDB } from "@torobot/shared";
import { Scanner } from "./scanner";
import { Currency } from "./currency";
import { MaxGasPrice } from "./maxGasPrice";
const scanners: Scanner[] = [];
const maxGasPriceScanners: MaxGasPrice[] = [];
import WebSocket from "ws";

export async function initScanner(wsServer: WebSocket.Server) {
  // get all dexs
  
  const dexs = await mongoDB.Dexes.populateModel(mongoDB.Dexes.find({})) as any;
  if (dexs) {
    for (let i = 0; i < dexs.length; i++) {
      const dex = dexs[i] as IStoredDex;
      const node = await mongoDB.Nodes.populateModel(mongoDB.Nodes.findById((dex.blockchain as IStoredBlockchain).node)) as any
      const _scanner: Scanner = new Scanner(node as IStoredNode, dex, wsServer)
      _scanner.start()
      scanners.push(_scanner);
    }
  }

  const blockchains = await mongoDB.Blockchains.populateModel(mongoDB.Blockchains.find({})) as any;
  if (blockchains) {
    for (let i = 0; i < blockchains.length; i++) {
      if (blockchains[i].node && blockchains[i].node.rpcProviderURL) {
        const _maxGasPriceScanner = new MaxGasPrice(blockchains[i], blockchains[i].node as IStoredNode, wsServer)
        _maxGasPriceScanner.start();
        maxGasPriceScanners.push(_maxGasPriceScanner);
      }
    }
  }
}

export async function startCurrencyScan() {
  const currency = new Currency();
  currency.start();
}

export function getMaxGasPriceByBlockchainName(blockchainName: string): number {
  if (maxGasPriceScanners.length === 0) {
    return -1;
  }
  for (let i = 0; i < maxGasPriceScanners.length; i++) {
    if (maxGasPriceScanners[i].blockchain.name === blockchainName) {
      return maxGasPriceScanners[i].getMaxGasPrice();
    }
  }
  return -1;
}