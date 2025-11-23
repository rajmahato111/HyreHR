import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JobBoardPostingService } from './job-board-posting.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';
import { Permission } from '../../auth/constants/permissions';
import { ParseUUIDPipe } from '../../../common/pipes/parse-uuid.pipe';
import { PostJobToBoardDto } from '../dto/post-job-to-board.dto';

@Controller('jobs/:jobId/postings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JobBoardController {
  constructor(private readonly jobBoardPostingService: JobBoardPostingService) {}

  @Post()
  @RequirePermissions(Permission.JOBS_UPDATE)
  async postJobToBoard(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() dto: PostJobToBoardDto,
    @CurrentUser() user: User,
  ) {
    return this.jobBoardPostingService.postJobToBoard(
      jobId,
      dto.integrationId,
      user.organizationId,
    );
  }

  @Get()
  @RequirePermissions(Permission.JOBS_READ)
  async getJobPostings(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: User,
  ) {
    return this.jobBoardPostingService.getJobPostings(jobId, user.organizationId);
  }

  @Put(':postingId')
  @RequirePermissions(Permission.JOBS_UPDATE)
  async updateJobOnBoard(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('postingId') postingId: string,
    @CurrentUser() user: User,
  ) {
    return this.jobBoardPostingService.updateJobOnBoard(
      jobId,
      postingId,
      user.organizationId,
    );
  }

  @Delete(':postingId')
  @RequirePermissions(Permission.JOBS_UPDATE)
  async closeJobOnBoard(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('postingId') postingId: string,
    @CurrentUser() user: User,
  ) {
    await this.jobBoardPostingService.closeJobOnBoard(
      jobId,
      postingId,
      user.organizationId,
    );
    return { message: 'Job posting closed successfully' };
  }

  @Post(':postingId/sync')
  @RequirePermissions(Permission.JOBS_READ)
  async syncJobPosting(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('postingId') postingId: string,
    @CurrentUser() user: User,
  ) {
    return this.jobBoardPostingService.syncJobPosting(
      jobId,
      postingId,
      user.organizationId,
    );
  }
}
