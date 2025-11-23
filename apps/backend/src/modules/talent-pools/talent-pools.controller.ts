import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TalentPoolsService } from './talent-pools.service';
import { EmailSequencesService } from './email-sequences.service';
import { SavedSearchesService } from './saved-searches.service';
import {
  CreateTalentPoolDto,
  UpdateTalentPoolDto,
  AddCandidatesDto,
  CreateEmailSequenceDto,
  UpdateEmailSequenceDto,
  EnrollCandidatesDto,
  CreateSavedSearchDto,
  UpdateSavedSearchDto,
} from './dto';

@Controller('talent-pools')
@UseGuards(JwtAuthGuard)
export class TalentPoolsController {
  constructor(
    private readonly talentPoolsService: TalentPoolsService,
    private readonly emailSequencesService: EmailSequencesService,
    private readonly savedSearchesService: SavedSearchesService,
  ) {}

  // Talent Pool endpoints
  @Post()
  createPool(@Request() req, @Body() createDto: CreateTalentPoolDto) {
    return this.talentPoolsService.create(
      req.user.organizationId,
      createDto,
    );
  }

  @Get()
  findAllPools(@Request() req) {
    return this.talentPoolsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOnePool(@Request() req, @Param('id') id: string) {
    return this.talentPoolsService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  updatePool(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateTalentPoolDto,
  ) {
    return this.talentPoolsService.update(
      id,
      req.user.organizationId,
      updateDto,
    );
  }

  @Delete(':id')
  removePool(@Request() req, @Param('id') id: string) {
    return this.talentPoolsService.remove(id, req.user.organizationId);
  }

  @Post(':id/candidates')
  addCandidates(
    @Request() req,
    @Param('id') id: string,
    @Body() addDto: AddCandidatesDto,
  ) {
    return this.talentPoolsService.addCandidates(
      id,
      req.user.organizationId,
      addDto,
    );
  }

  @Delete(':id/candidates')
  removeCandidates(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { candidateIds: string[] },
  ) {
    return this.talentPoolsService.removeCandidates(
      id,
      req.user.organizationId,
      body.candidateIds,
    );
  }

  @Post(':id/sync')
  syncPool(@Request() req, @Param('id') id: string) {
    return this.talentPoolsService.syncDynamicPool(
      id,
      req.user.organizationId,
    );
  }

  @Get(':id/candidates')
  getPoolCandidates(@Request() req, @Param('id') id: string) {
    return this.talentPoolsService.getCandidates(
      id,
      req.user.organizationId,
    );
  }

  // Email Sequence endpoints
  @Post('sequences')
  createSequence(
    @Request() req,
    @Body() createDto: CreateEmailSequenceDto,
  ) {
    return this.emailSequencesService.create(
      req.user.organizationId,
      req.user.id,
      createDto,
    );
  }

  @Get('sequences')
  findAllSequences(@Request() req) {
    return this.emailSequencesService.findAll(req.user.organizationId);
  }

  @Get('sequences/:id')
  findOneSequence(@Request() req, @Param('id') id: string) {
    return this.emailSequencesService.findOne(id, req.user.organizationId);
  }

  @Put('sequences/:id')
  updateSequence(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmailSequenceDto,
  ) {
    return this.emailSequencesService.update(
      id,
      req.user.organizationId,
      updateDto,
    );
  }

  @Delete('sequences/:id')
  removeSequence(@Request() req, @Param('id') id: string) {
    return this.emailSequencesService.remove(id, req.user.organizationId);
  }

  @Post('sequences/:id/enroll')
  enrollCandidates(
    @Request() req,
    @Param('id') id: string,
    @Body() enrollDto: EnrollCandidatesDto,
  ) {
    return this.emailSequencesService.enrollCandidates(
      id,
      req.user.organizationId,
      enrollDto,
    );
  }

  @Get('sequences/:id/enrollments')
  getEnrollments(@Request() req, @Param('id') id: string) {
    return this.emailSequencesService.getEnrollments(
      id,
      req.user.organizationId,
    );
  }

  @Delete('sequences/:id/enrollments/:candidateId')
  unenrollCandidate(
    @Request() req,
    @Param('id') id: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.emailSequencesService.unenrollCandidate(
      id,
      req.user.organizationId,
      candidateId,
    );
  }

  // Saved Search endpoints
  @Post('saved-searches')
  createSavedSearch(
    @Request() req,
    @Body() createDto: CreateSavedSearchDto,
  ) {
    return this.savedSearchesService.create(
      req.user.organizationId,
      req.user.id,
      createDto,
    );
  }

  @Get('saved-searches')
  findAllSavedSearches(@Request() req) {
    return this.savedSearchesService.findAll(
      req.user.organizationId,
      req.user.id,
    );
  }

  @Get('saved-searches/:id')
  findOneSavedSearch(@Request() req, @Param('id') id: string) {
    return this.savedSearchesService.findOne(
      id,
      req.user.organizationId,
      req.user.id,
    );
  }

  @Put('saved-searches/:id')
  updateSavedSearch(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateSavedSearchDto,
  ) {
    return this.savedSearchesService.update(
      id,
      req.user.organizationId,
      req.user.id,
      updateDto,
    );
  }

  @Delete('saved-searches/:id')
  removeSavedSearch(@Request() req, @Param('id') id: string) {
    return this.savedSearchesService.remove(
      id,
      req.user.organizationId,
      req.user.id,
    );
  }

  @Post('saved-searches/:id/use')
  recordSearchUsage(@Request() req, @Param('id') id: string) {
    return this.savedSearchesService.recordUsage(
      id,
      req.user.organizationId,
      req.user.id,
    );
  }
}
