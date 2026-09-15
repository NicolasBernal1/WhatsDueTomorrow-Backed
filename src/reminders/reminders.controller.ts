import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RemindersService, ReminderRunResult } from './reminders.service';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post('trigger')
  async trigger(): Promise<BaseResponseDto<ReminderRunResult>> {
    return this.remindersService.sendDueTomorrowReminders();
  }
}
