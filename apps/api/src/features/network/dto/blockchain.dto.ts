import { IsNumber, IsNotEmpty, IsString, IsEthereumAddress } from 'class-validator';

export class BlockchainDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  chainId: number;

  @IsNotEmpty()
  @IsString()
  coinSymbol: string;
}
