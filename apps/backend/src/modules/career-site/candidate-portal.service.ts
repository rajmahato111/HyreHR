import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CandidatePortalUser } from '../../database/entities/candidate-portal-user.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { Application } from '../../database/entities/application.entity';
import { Interview } from '../../database/entities/interview.entity';
import { CandidatePortalLoginDto, CandidatePortalRegisterDto } from './dto/candidate-portal-login.dto';

@Injectable()
export class CandidatePortalService {
  constructor(
    @InjectRepository(CandidatePortalUser)
    private portalUserRepository: Repository<CandidatePortalUser>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: CandidatePortalRegisterDto): Promise<{ token: string }> {
    // Verify candidate exists
    const candidate = await this.candidateRepository.findOne({
      where: { id: registerDto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Check if portal user already exists
    const existing = await this.portalUserRepository.findOne({
      where: { candidateId: registerDto.candidateId },
    });

    if (existing) {
      throw new BadRequestException('Portal account already exists for this candidate');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create portal user
    const portalUser = this.portalUserRepository.create({
      candidateId: registerDto.candidateId,
      email: registerDto.email,
      passwordHash,
      active: true,
      emailVerified: false,
    });

    await this.portalUserRepository.save(portalUser);

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: portalUser.id,
      candidateId: portalUser.candidateId,
      email: portalUser.email,
      type: 'candidate_portal',
    });

    return { token };
  }

  async login(loginDto: CandidatePortalLoginDto): Promise<{ token: string; candidate: any }> {
    // Find portal user
    const portalUser = await this.portalUserRepository.findOne({
      where: { email: loginDto.email },
      relations: ['candidate'],
    });

    if (!portalUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, portalUser.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!portalUser.active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Update last login
    portalUser.lastLogin = new Date();
    await this.portalUserRepository.save(portalUser);

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: portalUser.id,
      candidateId: portalUser.candidateId,
      email: portalUser.email,
      type: 'candidate_portal',
    });

    return {
      token,
      candidate: {
        id: portalUser.candidate.id,
        firstName: portalUser.candidate.firstName,
        lastName: portalUser.candidate.lastName,
        email: portalUser.candidate.email,
      },
    };
  }

  async getApplications(candidateId: string): Promise<any[]> {
    const applications = await this.applicationRepository.find({
      where: { candidateId },
      relations: ['job', 'stage', 'job.department', 'job.locations'],
      order: { appliedAt: 'DESC' },
    });

    return applications.map((app) => ({
      id: app.id,
      job: {
        id: app.job.id,
        title: app.job.title,
        department: app.job.department?.name,
        locations: app.job.locations?.map((loc) => loc.name).join(', '),
      },
      stage: {
        id: app.stage.id,
        name: app.stage.name,
      },
      status: app.status,
      appliedAt: app.appliedAt,
      stageEnteredAt: app.stageEnteredAt,
    }));
  }

  async getInterviews(candidateId: string): Promise<any[]> {
    // Get all applications for this candidate
    const applications = await this.applicationRepository.find({
      where: { candidateId },
      select: ['id'],
    });

    const applicationIds = applications.map((app) => app.id);

    if (applicationIds.length === 0) {
      return [];
    }

    // Get interviews for these applications
    const interviews = await this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.application', 'application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('interview.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('interview.application_id IN (:...applicationIds)', { applicationIds })
      .orderBy('interview.scheduled_at', 'ASC')
      .getMany();

    return interviews.map((interview) => ({
      id: interview.id,
      job: {
        id: interview.application.job.id,
        title: interview.application.job.title,
      },
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      status: interview.status,
      locationType: interview.locationType,
      locationDetails: interview.locationDetails,
      meetingLink: interview.meetingLink,
      interviewers: interview.participants?.map((p) => ({
        name: `${p.user.firstName} ${p.user.lastName}`,
        role: p.role,
      })),
    }));
  }

  async uploadDocument(
    candidateId: string,
    documentType: string,
    documentUrl: string,
  ): Promise<void> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Add document URL to candidate's resume URLs
    if (!candidate.resumeUrls.includes(documentUrl)) {
      candidate.resumeUrls.push(documentUrl);
      await this.candidateRepository.save(candidate);
    }
  }
}
