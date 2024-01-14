import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { AutoBotDto } from '../dto/autobot.dto';
import { AutoBotService } from '../service/autobot.service';
import { IUserDocument, AutoBotTradingDto } from "@torobot/shared"

@ApiTags("autobot")
@Controller('autobot')
@UseGuards(JwtAuthGuard)
export class AutoBotController {
  constructor(
    private autobotService: AutoBotService
  ) {}

  @Get('/all')
  getAll() {
    return this.autobotService.getAll();
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.autobotService.getById(id);
  }

  // @Delete(':id')
  // async delete(
  //   @Param('id', ParseObjectIdPipe) id: string
  // ) {
  //   return this.autobotService.delete(
  //     await this.autobotService.validate(id),
  //   );
  // }

  @Post()
  async create(@Body() payload: AutoBotDto, @CurrentUser() user: IUserDocument) {
    const autobotDto = await this.autobotService.fillDtoByDetail(payload);
    return this.autobotService.create(autobotDto as any, user);
  }

  // @Put(':id')
  // async update(
  //   @Param('id', ParseObjectIdPipe) id: string,
  //   @Body() payload: AutoBotDto
  // ) {
  //   let autobotDto: any = payload;
  //   if (payload.blockchain && payload.tokenAddress) {
  //     autobotDto = await this.autobotService.fillDtoByDetail(payload);
  //   } 
  //   return this.autobotService.update(
  //     await this.autobotService.validate(id),
  //     autobotDto
  //   );
  // }

  // @Post('/start')
  // async start(@Body() payload: AutoBotTradingDto, @CurrentUser() user: IUserDocument) {
  //   return this.autobotService.trigger(payload, user);
  // }

  // @Post('/stop')
  // async stop(@Body() payload: AutoBotTradingDto, @CurrentUser() user: IUserDocument) {
  //   return this.autobotService.trigger(payload, user);
  // }

  // @Get('/status/all/:initiator')
  // getAllStatus(@Param('initiator') initiator: ETradingInitiator) {
  //   return this.autobotService.getAllStatus(initiator);
  // }

  @Get('log/:id')
  getLog(@Param('id', ParseObjectIdPipe) id: string) {
    return this.autobotService.getLog(id);
  }

  @Get('history/:id')
  getHistory(@Param('id', ParseObjectIdPipe) id: string) {
    return this.autobotService.getHistory(id);
  }
}
