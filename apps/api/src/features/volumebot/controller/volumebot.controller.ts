import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';

import { ApiTags } from "@nestjs/swagger";
import { ParseObjectIdPipe } from 'src/shared/pipe/parse-object-id.pipe';
import { CurrentUser } from 'src/features/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/features/auth/guard/jwt-auth.guard';
import { VolumeBotDto } from '../dto/volumebot.dto';
import { VolumeBotService } from '../service/volumebot.service';
import { IUserDocument } from '@torobot/shared';

@ApiTags("volumebot")
@Controller('volumebot')
@UseGuards(JwtAuthGuard)
export class VolumeBotController {
  constructor(
    private volumebotService: VolumeBotService
  ) { }

  @Get('/all')
  getAll() {
    return this.volumebotService.getAll();
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.volumebotService.getById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: VolumeBotDto
  ) {
    let botDto: any = payload;
    // if (payload.blockchain && payload.token) {
    //   botDto = await this.volumebotService.fillDtoByDetail(payload);
    // }
    return this.volumebotService.update(
      await this.volumebotService.validate(id),
      botDto
    )
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.volumebotService.delete(
      await this.volumebotService.validate(id)
    );
  }
  
  @Post()
  async create(@Body() payload: VolumeBotDto, @CurrentUser() user: IUserDocument) {
    const volumebotDto = await this.volumebotService.fillDtoByDetail(payload);
    return this.volumebotService.create(volumebotDto as any, user);
  }

  @Get('log/Lid')
  getLog(@Param('id', ParseObjectIdPipe) id: string) {
    return this.volumebotService.getLog(id);
  }
}