import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PoolDto } from '../dto/pool.dto';
import { PoolService } from '../service/pool.service';
import { IUserDocument, PoolFilter } from "@torobot/shared"

@ApiTags("pool")
@Controller('pool')
export class PoolController {
  constructor(private poolService: PoolService) {}

  @Get('/all')
  async getAll() {
    return this.poolService.getAll();
  }

  @Post('/search')
  async search(@Body() filter: PoolFilter) {
    return this.poolService.search(filter);
  }

  @Post()
  async create(@Body() payload: PoolDto, @CurrentUser() user: IUserDocument) {
    return this.poolService.create(payload as any);
  }
}
