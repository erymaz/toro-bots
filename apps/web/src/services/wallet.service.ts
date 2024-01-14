import { http } from '../services/api'
import { IWalletAddRequest, IWallet, IWalletEditRequest } from '../types/wallet.types'

class WalletService {
  async getAll () {
    const response = await http.get<IWallet[]>('/wallet/all');
    return response.data;
  }

  async getMyWallets () {
    const response = await http.get<IWallet[]>('/wallet');
    return response.data;
  }

  async getWalletById (walletId: string) {
    const response = await http.get<IWallet>(`/wallet/id/${walletId}`);
    return response.data;
  }

  async addWallet (payload: IWalletAddRequest) {
    const response = await http.post<IWallet>('/wallet', payload);
    return response.data;
  }

  async updateWallet(walletId: string, payload: IWalletEditRequest) {
    const response = await http.put<IWallet>(`/wallet/${walletId}`, payload);
    return response.data;
  }

  async deleteWallet (walletId: string) {
    const response = await http.delete<IWallet>(`/wallet/${walletId}`);
    return response.data;
  }
}

export const walletService = new WalletService()
