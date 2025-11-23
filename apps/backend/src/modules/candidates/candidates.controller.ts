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
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import {
  CreateCandidateDto,
  UpdateCandidateDto,
  FilterCandidateDto,
  MergeCandidateDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { Permission } from '../auth/constants/permissions';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

@Controller('candidates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @RequirePermissions(Permission.CANDIDATES_CREATE)
  async create(
    @Body() createCandidateDto: CreateCandidateDto,
    @CurrentUser() user: User,
  ) {
    return this.candidatesService.create(
      createCandidateDto,
      user.organizationId,
    );
  }

  @Get()
  @RequirePermissions(Permission.CANDIDATES_READ)
  async findAll(
    @Query() filterDto: FilterCandidateDto,
    @CurrentUser() user: User,
  ) {
    return this.candidatesService.findAll(filterDto, user.organizationId);
  }

  @Post('search')
  @RequirePermissions(Permission.CANDIDATES_READ)
  async search(
    @Body() searchQuery: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @CurrentUser() user: User,
  ) {
    return this.candidatesService.searchWithElasticsearch(
      searchQuery,
      user.organizationId,
      page,
      limit,
    );
  }

  @Get('statistics')
  @RequirePermissions(Permission.CANDIDATES_READ)
  async getStatistics(@CurrentUser() user: User) {
    return this.candidatesService.getStatistics(user.organizationId);
  }

  @Get(':id')
  @RequirePermissions(Permission.CANDIDATES_READ)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.candidatesService.findOne(id, user.organizationId);
  }

  @Get(':id/duplicates')
  @RequirePermissions(Permission.CANDIDATES_READ)
  async findDuplicates(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const candidate = await this.candidatesService.findOne(
      id,
      user.organizationId,
    );
    return this.candidatesService.findDuplicates(
      candidate.email,
      user.organizationId,
      id,
    );
  }

  @Put(':id')
  @RequirePermissions(Permission.CANDIDATES_UPDATE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @CurrentUser() user: User,
  ) {
    return this.candidatesService.update(
      id,
      updateCandidateDto,
      user.organizationId,
    );
  }

  @Delete(':id')
  @RequirePermissions(Permission.CANDIDATES_DELETE)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.candidatesService.remove(id, user.organizationId);
    return { message: 'Candidate deleted successfully' };
  }

  @Post(':id/merge')
  @RequirePermissions(Permission.CANDIDATES_MERGE)
  async merge(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() mergeCandidateDto: MergeCandidateDto,
    @CurrentUser() user: User,
  ) {
    return this.candidatesService.merge(
      id,
      mergeCandidateDto,
      user.organizationId,
      user.id,
    );
  }

  @Get(':id/merge-history')
  @RequirePermissions(Permission.CANDIDATES_READ)
  async getMergeHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.candidatesService.getMergeHistory(id, user.organizationId);
  }

  @Post('from-parsed-data')
  @RequirePermissions(Permission.CANDIDATES_CREATE)
  async createFromParsedData(
    @Body() data: any,
    @CurrentUser() user: User,
  ) {
    return this.candidatesService.create(data, user.organizationId);
  }
}
