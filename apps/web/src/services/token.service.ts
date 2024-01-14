import { http } from '../services/api'
import { ITokenInfoRequest, ITokenInfo, ITokenDetailReqDto, ITokenDetailDto } from '../types/token.types'

class TokenService {
  async getTokenInfo (payload: ITokenInfoRequest) {
    const res = await http.post<ITokenInfo>(`/token/info`, payload);
    return res.data;
  }

  async getTokenDetail (payload: ITokenDetailReqDto) {
    const res = await http.post<ITokenDetailDto>(`/token/detail`, payload);
    return res.data;
  }
}

export const tokenService = new TokenService()
