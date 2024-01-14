import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { IVolumeBot } from '../../types';
import { VOLUME_BOT_ADD, VOLUME_BOT_LOAD_ALL, VOLUME_BOT_DELETE, VOLUME_BOT_UPDATE } from '../action-types';

export interface VolumeBotState {
  bots: IVolumeBot[],
}

interface VolumeBotAction extends Action {
  payload: {
    bots: IVolumeBot[],
    newBot: IVolumeBot,
    botId: string,
    updatedBot: IVolumeBot
  }
}

const initialState: VolumeBotState = {
  bots: [],
}

export const volumeBotReducer: Reducer<VolumeBotState, VolumeBotAction> = handleActions(
  {
    [VOLUME_BOT_LOAD_ALL]: (state: VolumeBotState, { payload: { bots }}: VolumeBotAction) => ({
      ...state,
      bots,
    }),
    [VOLUME_BOT_ADD]: (state: VolumeBotState, { payload: { newBot }}: VolumeBotAction) => {
      let bots = state.bots.slice();
      bots.unshift(newBot);
      return {
        ...state,
        bots
      }
    },
    [VOLUME_BOT_DELETE]: (state: VolumeBotState, { payload: { botId }}: VolumeBotAction) => {
      let bots = state.bots.slice();
      return {
        ...state,
        bots: bots.filter(item => item._id !== botId)
      }
    },
    [VOLUME_BOT_UPDATE]: (state: VolumeBotState, { payload: { updatedBot }}: VolumeBotAction) => {
      const bots = state.bots.map(item => item._id === updatedBot._id ? updatedBot : item);
      return {
        ...state,
        bots,
      };
    },
  },
  initialState,
);
