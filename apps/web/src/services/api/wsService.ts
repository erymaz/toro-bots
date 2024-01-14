import { w3cwebsocket as WebSocket } from "websocket";

import config from "../../config";
import { ESocketType, MultiValue, ISocketData } from '../../types';
class WsService {
  socket: WebSocket;

  constructor () {
    this.socket = new WebSocket(config.ENGINE_WS_URL);
    this.init();
  }

  private init() {
    this.socket.onopen = () => {
      console.log('WebSocket Client Connected');
    }
  }

  wsAction(type: ESocketType, params: MultiValue) {
    const data: ISocketData = {
      type: type,
      data: params
    }
    this.socket.send(JSON.stringify(data));
  }
}

export const ws = new WsService();
