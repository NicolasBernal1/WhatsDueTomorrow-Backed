import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { CreateEvaluationDto } from './dtos/create-evaluation.dto';
import { EvaluationListResponseDto } from './dtos/evaluation-list-response.dto';
import { SimulateGradeDto } from './dtos/simulate-grade.dto';
import { UpdateEvaluationDto } from './dtos/update-evaluation.dto';
import { EvaluationsService } from './evaluations.service';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email?: string;
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('subjects/:subjectId/evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  getBySubject(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
  ): Promise<BaseResponseDto<EvaluationListResponseDto>> {
    return this.evaluationsService.getBySubject(req.user.sub, subjectId);
  }

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Body() dto: CreateEvaluationDto,
  ): Promise<BaseResponseDto<EvaluationListResponseDto>> {
    return this.evaluationsService.create(req.user.sub, subjectId, dto);
  }

  @Patch(':evaluationId')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Param('evaluationId', ParseIntPipe) evaluationId: number,
    @Body() dto: UpdateEvaluationDto,
  ): Promise<BaseResponseDto<EvaluationListResponseDto>> {
    return this.evaluationsService.update(
      req.user.sub,
      subjectId,
      evaluationId,
      dto,
    );
  }

  @Delete(':evaluationId')
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Param('evaluationId', ParseIntPipe) evaluationId: number,
  ): Promise<BaseResponseDto<EvaluationListResponseDto>> {
    return this.evaluationsService.remove(
      req.user.sub,
      subjectId,
      evaluationId,
    );
  }

  @Post('simulate')
  simulate(
    @Request() req: AuthenticatedRequest,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Body() dto: SimulateGradeDto,
  ): Promise<BaseResponseDto<any>> {
    return this.evaluationsService.simulate(req.user.sub, subjectId, dto);
  }
}
