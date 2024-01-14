import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { TokenModule } from '../token/token.module';
import { TransactionModule } from '../transaction/transaction.module';

import { VolumeBotService } from './service/volumebot.service';
import { VolumeBotController } from './controller/volumebot.controller';


@Module({
  imports: [
    AuthModule,
    SharedModule,
    TokenModule,
    TransactionModule
  ],
  controllers: [VolumeBotController],
  providers: [VolumeBotService],
  exports: [VolumeBotService],
})
export class VolumeBotModule {}
