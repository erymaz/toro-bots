import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { IAutoBot, IPool } from '../../types';
import { POOL_LOAD_ALL, AUTO_BOT_ADD, AUTO_BOT_UPDATE } from '../action-types';

export interface PoolState {
  pools: IPool[];
  total: number;
}

interface PoolAction extends Action {
  payload: {
    pools: IPool[],
    total: number,
    addBot: {
      _id: string,
      newBot: IAutoBot
    },
    updateBot: IAutoBot
  }
}

const initialState: PoolState = {
  pools: [],
  total: 0,
}

export const poolReducer: Reducer<PoolState, PoolAction> = handleActions(
  {
    [POOL_LOAD_ALL]: (state: PoolState, { payload: { pools, total }}: PoolAction) => ({
      pools,
      total: total
    }),
    
    [AUTO_BOT_ADD]: (state: PoolState, { payload: { addBot }}: PoolAction) => {
      const pools = state.pools.map(el => {
        if (el._id === addBot._id) {
          return {
            ...el,
            autoBot: addBot.newBot
          }
        } else {
          return el;
        }
      });

      return {
        ...state,
        pools,
      };
    },

    [AUTO_BOT_UPDATE]: (state: PoolState, { payload: { updateBot }}: PoolAction) => {
      const pools = state.pools.map(el => {
        if (el.autoBot?._id === updateBot._id) {
          return {
            ...el,
            autoBot: updateBot
          }
        } else {
          return el;
        }
      });

      return {
        ...state,
        pools,
      };
    },
  },
  initialState,
);
