import { PoolService } from './service/pool.service';
import { PoolController } from './controller/pool.controller';

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    AuthModule,
    SharedModule,
  ],
  controllers: [PoolController],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}
