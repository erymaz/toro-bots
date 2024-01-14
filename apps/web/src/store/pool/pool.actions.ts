import { Dispatch } from 'redux'
import { hideLoading } from 'react-redux-loading-bar';

import { POOL_LOAD_ALL, AUTO_BOT_ADD, AUTO_BOT_UPDATE } from '../action-types';
import errorHandler from '../error-handler';
import { poolService, botService } from '../../services';
import { PoolFilter, IAutoBotAddRequest, IAutoBot } from '../../types';
import { showNotification } from "../../shared/helpers";

export const searchPools = (filter: PoolFilter) => async (dispatch: Dispatch) => {
    try {
        const res = await poolService.search(filter);

        dispatch({
            type: POOL_LOAD_ALL,
            payload: {
                pools: res.pools,
                total: res.total
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, POOL_LOAD_ALL)
    }
}

export const addBot = (payload: IAutoBotAddRequest) => async (dispatch: Dispatch) => {
  try {
    const newBot = await botService.addAutoBot(payload);
    showNotification("Auto bot is created successfully", 'success', 'topRight');

    dispatch({
      type: AUTO_BOT_ADD,
      payload: {
        addBot: {
          _id: payload.pool,
          newBot
        }
      },
    });
  } catch (error: any) {
    errorHandler(error, AUTO_BOT_ADD);
  }
}

export const updateBot = (payload: IAutoBot) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: AUTO_BOT_UPDATE,
      payload: {
        updateBot: payload
      },
    });
  } catch (error: any) {
    errorHandler(error, AUTO_BOT_UPDATE);
  }
}
