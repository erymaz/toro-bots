import { http } from '../services/api'
import { 
  IBotAddRequest, 
  IBotTradingRequest, 
  IBot, 
  IBotUpdateRequest, 
  IBotStatus, 
  IBotHistory,
  IAutoBotAddRequest,
  IVolumeBotAddRequest,
  ETradingInitiator,
  IAutoBot,
  IVolumeBot
 } from '../types'

class BotService {
  async getAll (initiator: ETradingInitiator=ETradingInitiator.BOT) {
    const res = await http.get<IBot[]>(`/bot/all/${initiator}`);
    return res.data;
  }

  async getMyBots () {
    const res = await http.put<IBot[]>('/bot')
    return res.data;
  }

  async getBotById (botId: string) {
    const res = await http.get<IBot>(`/bot/id/${botId}`);
    return res.data;
  }

  async addBot (payload: IBotAddRequest) {
    const res = await http.post<IBot>('/bot', payload);
    return res.data;
  }

  async updateBot(botId: string, payload: IBotUpdateRequest) {
    const res = await http.put<IBot>(`/bot/${botId}`, payload);
    return res.data;
  }

  async deleteBot (botId: string) {
    const res = await http.delete<IBot>(`/bot/${botId}`);
    return res.data;
  }

  async startBot (payload: IBotTradingRequest) {
    const res = await http.post<IBot>('/bot/start', payload);
    return res.data;
  }

  async stopBot (payload: IBotTradingRequest) {
    const res = await http.post<IBot>('/bot/stop', payload);
    return res.data;
  }

  async getAllStatus (initiator: ETradingInitiator=ETradingInitiator.BOT) {
    const res = await http.get<IBotStatus[]>(`/bot/status/all/${initiator}`);
    return res.data;
  }

  async getBotLog (botId: string) {
    const res = await http.get<any>(`/bot/log/${botId}`);
    return res;
  }

  async getBotHistory (botId: string) {
    const res = await http.get<IBotHistory[]>(`/bot/history/${botId}`);
    return res;
  }

  async addAutoBot (payload: IAutoBotAddRequest) {
    const res = await http.post<IAutoBot>('/autobot', payload);
    return res.data;
  }

  async getAutoBotById (botId: string) {
    const res = await http.get<IAutoBot>(`/autobot/id/${botId}`);
    return res.data;
  }

  async getAutoBotHistory (botId: string) {
    const res = await http.get<IBotHistory[]>(`/autobot/history/${botId}`);
    return res;
  }

  async getAutoBotLog (botId: string) {
    const res = await http.get<any>(`/autobot/log/${botId}`);
    return res;
  }

  async getVolumeBots () {
    const res = await http.get<IVolumeBot[]>('/volumebot/all');
    return res.data;
  }

  async addVolumeBot (payload: IVolumeBotAddRequest) {
    const res = await http.post<IVolumeBot>('/volumebot', payload);
    return res.data;
  }

  async deleteVolumeBot (botId: string) {
    const res = await http.delete<IVolumeBot>(`/volumebot/${botId}`);
    return res.data;
  }

  async updateVolumeBot(botId: string, payload: IVolumeBotAddRequest) {
    const res = await http.put<IVolumeBot>(`/volumebot/${botId}`, payload);
    return res.data;
  }
}

export const botService = new BotService()
