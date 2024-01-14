import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NetworkModule } from './network/network.module';
import { WalletModule } from './wallet/wallet.module';
import { TokenModule } from './token/token.module';
import { BotModule } from './bot/bot.module';
import { TransactionModule } from './transaction/transaction.module';
import { PoolModule } from './pool/pool.module';
import { AutoBotModule } from './autobot/autobot.module';
import { VolumeBotModule } from './volumebot/volumebot.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    NetworkModule,
    WalletModule,
    TokenModule,
    BotModule,
    TransactionModule,
    PoolModule,
    AutoBotModule,
    VolumeBotModule
  ],
  controllers: [],
  exports: [
    AuthModule,
    UserModule,
    NetworkModule,
    WalletModule,
    TokenModule,
    BotModule,
    TransactionModule,
    PoolModule,
    AutoBotModule,
    VolumeBotModule
  ],
})
export class FeaturesModule {}
