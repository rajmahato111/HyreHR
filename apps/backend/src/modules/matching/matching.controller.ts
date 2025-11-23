import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CandidateMatchingService } from './candidate-matching.service';
import { SkillMatchingService } from './skill-matching.service';
import { TitleMatchingService } from './title-matching.service';
import {
  CalculateMatchDto,
  CalculateJobMatchesDto,
  UpdateApplicationMatchDto,
} from './dto/match.dto';
import {
  CalculateSkillMatchDto,
  ExtractSkillsDto,
  NormalizeSkillsDto,
  GetSkillSuggestionsDto,
} from './dto/skill-match.dto';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(
    private readonly candidateMatchingService: CandidateMatchingService,
    private readonly skillMatchingService: SkillMatchingService,
    private readonly titleMatchingService: TitleMatchingService,
  ) {}

  @Post('calculate')
  async calculateMatch(@Body() dto: CalculateMatchDto) {
    const weights: Record<string, number> = {};
    
    if (dto.skillsWeight !== undefined) weights.skills = dto.skillsWeight;
    if (dto.experienceWeight !== undefined) weights.experience = dto.experienceWeight;
    if (dto.educationWeight !== undefined) weights.education = dto.educationWeight;
    if (dto.locationWeight !== undefined) weights.location = dto.locationWeight;
    if (dto.titleWeight !== undefined) weights.title = dto.titleWeight;

    return this.candidateMatchingService.calculateMatch(
      dto.candidateId,
      dto.jobId,
      Object.keys(weights).length > 0 ? weights : undefined,
    );
  }

  @Post('job-matches')
  async calculateJobMatches(@Body() dto: CalculateJobMatchesDto) {
    const weights: Record<string, number> = {};
    
    if (dto.skillsWeight !== undefined) weights.skills = dto.skillsWeight;
    if (dto.experienceWeight !== undefined) weights.experience = dto.experienceWeight;
    if (dto.educationWeight !== undefined) weights.education = dto.educationWeight;
    if (dto.locationWeight !== undefined) weights.location = dto.locationWeight;
    if (dto.titleWeight !== undefined) weights.title = dto.titleWeight;

    return this.candidateMatchingService.calculateMatchesForJob(
      dto.jobId,
      dto.candidateIds,
      Object.keys(weights).length > 0 ? weights : undefined,
    );
  }

  @Post('application/:id/update-score')
  async updateApplicationMatchScore(@Param('id') applicationId: string) {
    await this.candidateMatchingService.updateApplicationMatchScore(applicationId);
    return { message: 'Match score updated successfully' };
  }

  @Post('skills/calculate')
  async calculateSkillMatch(@Body() dto: CalculateSkillMatchDto) {
    return this.skillMatchingService.calculateSkillMatch(
      dto.candidateSkills,
      dto.requiredSkills,
      dto.preferredSkills,
    );
  }

  @Post('skills/extract')
  async extractSkills(@Body() dto: ExtractSkillsDto) {
    const skills = this.skillMatchingService.extractSkills(dto.text);
    return { skills };
  }

  @Post('skills/normalize')
  async normalizeSkills(@Body() dto: NormalizeSkillsDto) {
    const normalized = this.skillMatchingService.normalizeSkills(dto.skills);
    return { normalized };
  }

  @Post('skills/suggestions')
  async getSkillSuggestions(@Body() dto: GetSkillSuggestionsDto) {
    const suggestions = this.skillMatchingService.getSuggestedSkills(
      dto.skills,
      dto.limit,
    );
    return { suggestions };
  }

  @Get('titles/:title/suggestions')
  async getTitleSuggestions(@Param('title') title: string) {
    const suggestions = this.titleMatchingService.getSuggestedTitles(title);
    return { suggestions };
  }
}
