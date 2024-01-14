import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { TokenModule } from '../token/token.module';
import { TransactionModule } from '../transaction/transaction.module';

import { BotService } from './service/bot.service';
import { BotEngineService } from './service/bot-engine.service';
import { BotController } from './controller/bot.controller';


@Module({
  imports: [
    AuthModule,
    SharedModule,
    TokenModule,
    TransactionModule
  ],
  controllers: [BotController],
  providers: [BotService, BotEngineService],
  exports: [BotService, BotEngineService],
})
export class BotModule {}
