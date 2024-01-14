import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { VOLUME_BOT_ADD, VOLUME_BOT_LOAD_ALL, VOLUME_BOT_DELETE, VOLUME_BOT_UPDATE } from '../action-types';
import errorHandler from '../error-handler';
import { botService } from '../../services';
import { IVolumeBot, IVolumeBotAddRequest } from '../../types';
import { showNotification } from "../../shared/helpers";

export const getVolumeBots = () => async (dispatch: Dispatch) => {
  try {
      dispatch(showLoading());
      const bots = await botService.getVolumeBots();
      dispatch(hideLoading());

      dispatch({
          type: VOLUME_BOT_LOAD_ALL,
          payload: {
              bots
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, VOLUME_BOT_LOAD_ALL)
  }
}

export const deleteVolumeBot = (botId: string) => async (dispatch: Dispatch) => {
  try {
      await botService.deleteVolumeBot(botId);

      dispatch({
          type: VOLUME_BOT_DELETE,
          payload: {
              botId,
          },
      });
  } catch (error: any) {
      errorHandler(error, VOLUME_BOT_DELETE)
  }
}

export const addVolumeBot = (payload: IVolumeBotAddRequest) => async (dispatch: Dispatch) => {
  try {
    const newBot = await botService.addVolumeBot(payload);
    showNotification("Volume bot is created successfully", 'success', 'topRight');

    dispatch({
      type: VOLUME_BOT_ADD,
      payload: {
          newBot
      },
    });
  } catch (error: any) {
    errorHandler(error, VOLUME_BOT_ADD);
  }
}

export const updateVolumeBot = (id: string, payload: IVolumeBotAddRequest) => async (dispatch: Dispatch) => {
  try {
      const updatedBot = await botService.updateVolumeBot(id, payload);

      dispatch({
          type: VOLUME_BOT_UPDATE,
          payload: {
              updatedBot
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, VOLUME_BOT_UPDATE)
  }
}

export const updateVolumeBotStatus = (payload: IVolumeBot) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: VOLUME_BOT_UPDATE,
      payload: {
        updatedBot: payload
      },
    });
  } catch (error: any) {
    errorHandler(error, VOLUME_BOT_UPDATE);
  }
}