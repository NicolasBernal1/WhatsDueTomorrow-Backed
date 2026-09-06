import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { CalendarSubscriptionDto } from './dtos/calendar-subscription.dto';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('subscription')
  async createSubscription(
    @Request() req,
  ): Promise<BaseResponseDto<CalendarSubscriptionDto>> {
    const token = await this.calendarService.getOrCreateToken(req.user.sub);
    const host = req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    return {
      status: 200,
      message: 'Calendar subscription created successfully',
      data: {
        webcalUrl: `${protocol === 'https' ? 'webcal' : 'webcal'}://${host}/calendar/feed/${token}.ics`,
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('download')
  async download(@Request() req, @Res() response: Response): Promise<void> {
    const calendar = await this.calendarService.generateForUser(req.user.sub);
    response.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="whats-due-tomorrow.ics"',
    );
    response.send(calendar);
  }

  @Get('feed/:token.ics')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  async feed(@Param('token') token: string): Promise<string> {
    return this.calendarService.generateForToken(token);
  }
}
