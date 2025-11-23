import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, FilterJobDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '../../database/entities/user.entity';
import { Permission } from '../auth/constants/permissions';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';
import { JobStatus } from '../../database/entities/job.entity';

@Controller('jobs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  async create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: User) {
    return this.jobsService.create(createJobDto, user.organizationId, user.id);
  }

  @Get()
  async findAll(@Query() filterDto: FilterJobDto, @CurrentUser() user?: User) {
    return this.jobsService.findAll(filterDto, user?.organizationId);
  }

  @Get('statistics')
  async getStatistics(@CurrentUser() user?: User) {
    return this.jobsService.getStatistics(user?.organizationId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.jobsService.findOne(id, user.organizationId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJobDto: UpdateJobDto,
    @CurrentUser() user: User,
  ) {
    return this.jobsService.update(id, updateJobDto, user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.jobsService.remove(id, user.organizationId);
    return { message: 'Job deleted successfully' };
  }

  @Post(':id/clone')
  async clone(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.jobsService.clone(id, user.organizationId, user.id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: JobStatus,
    @CurrentUser() user: User,
  ) {
    return this.jobsService.updateStatus(id, status, user.organizationId);
  }
}
