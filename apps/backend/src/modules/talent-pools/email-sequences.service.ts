import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import {
  EmailSequence,
  SequenceStatus,
  SequenceEnrollment,
  EnrollmentStatus,
  ResponseSentiment,
  Candidate,
  TalentPool,
} from '../../database/entities';
import {
  CreateEmailSequenceDto,
  UpdateEmailSequenceDto,
  EnrollCandidatesDto,
} from './dto';

@Injectable()
export class EmailSequencesService {
  constructor(
    @InjectRepository(EmailSequence)
    private sequenceRepository: Repository<EmailSequence>,
    @InjectRepository(SequenceEnrollment)
    private enrollmentRepository: Repository<SequenceEnrollment>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(TalentPool)
    private talentPoolRepository: Repository<TalentPool>,
  ) {}

  async create(
    organizationId: string,
    userId: string,
    createDto: CreateEmailSequenceDto,
  ): Promise<EmailSequence> {
    // Validate steps are in order
    const sortedSteps = [...createDto.steps].sort((a, b) => a.order - b.order);
    if (sortedSteps.some((step, idx) => step.order !== idx + 1)) {
      throw new BadRequestException('Steps must be numbered sequentially starting from 1');
    }

    const sequence = this.sequenceRepository.create({
      ...createDto,
      organizationId,
      createdBy: userId,
    });

    return this.sequenceRepository.save(sequence);
  }

  async findAll(organizationId: string): Promise<EmailSequence[]> {
    return this.sequenceRepository.find({
      where: { organizationId },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<EmailSequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id, organizationId },
      relations: ['creator'],
    });

    if (!sequence) {
      throw new NotFoundException(`Email sequence with ID ${id} not found`);
    }

    return sequence;
  }

  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateEmailSequenceDto,
  ): Promise<EmailSequence> {
    const sequence = await this.findOne(id, organizationId);

    // Don't allow editing active sequences
    if (sequence.status === SequenceStatus.ACTIVE && (updateDto as any).steps) {
      throw new BadRequestException('Cannot edit steps of an active sequence');
    }

    if ((updateDto as any).steps) {
      const sortedSteps = [...(updateDto as any).steps].sort((a, b) => a.order - b.order);
      if (sortedSteps.some((step, idx) => step.order !== idx + 1)) {
        throw new BadRequestException('Steps must be numbered sequentially starting from 1');
      }
    }

    Object.assign(sequence, updateDto);
    return this.sequenceRepository.save(sequence);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const sequence = await this.findOne(id, organizationId);

    // Check if there are active enrollments
    const activeEnrollments = await this.enrollmentRepository.count({
      where: {
        sequenceId: id,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (activeEnrollments > 0) {
      throw new BadRequestException(
        'Cannot delete sequence with active enrollments',
      );
    }

    await this.sequenceRepository.remove(sequence);
  }

  async enrollCandidates(
    id: string,
    organizationId: string,
    enrollDto: EnrollCandidatesDto,
  ): Promise<SequenceEnrollment[]> {
    const sequence = await this.findOne(id, organizationId);

    if (sequence.status !== SequenceStatus.ACTIVE) {
      throw new BadRequestException('Can only enroll candidates in active sequences');
    }

    // Verify candidates exist
    const candidates = await this.candidateRepository.find({
      where: {
        id: In(enrollDto.candidateIds),
        organizationId,
      },
    });

    if (candidates.length !== enrollDto.candidateIds.length) {
      throw new BadRequestException('Some candidates not found');
    }

    // Check for existing enrollments
    const existingEnrollments = await this.enrollmentRepository.find({
      where: {
        sequenceId: id,
        candidateId: In(enrollDto.candidateIds),
        status: In([EnrollmentStatus.ACTIVE, EnrollmentStatus.PAUSED]),
      },
    });

    const existingCandidateIds = new Set(
      existingEnrollments.map((e) => e.candidateId),
    );

    // Create enrollments for new candidates
    const newEnrollments = candidates
      .filter((c) => !existingCandidateIds.has(c.id))
      .map((candidate) => {
        const firstStep = sequence.steps[0];
        const nextSendAt = new Date();
        nextSendAt.setDate(nextSendAt.getDate() + firstStep.delayDays);
        nextSendAt.setHours(nextSendAt.getHours() + firstStep.delayHours);

        return this.enrollmentRepository.create({
          sequenceId: id,
          candidateId: candidate.id,
          poolId: enrollDto.poolId,
          status: EnrollmentStatus.ACTIVE,
          currentStep: 0,
          nextSendAt,
          enrolledAt: new Date(),
        });
      });

    const savedEnrollments = await this.enrollmentRepository.save(newEnrollments);

    // Update sequence stats
    sequence.totalEnrolled += savedEnrollments.length;
    await this.sequenceRepository.save(sequence);

    return savedEnrollments;
  }

  async getEnrollments(
    id: string,
    organizationId: string,
  ): Promise<SequenceEnrollment[]> {
    await this.findOne(id, organizationId);

    return this.enrollmentRepository.find({
      where: { sequenceId: id },
      relations: ['candidate'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async unenrollCandidate(
    id: string,
    organizationId: string,
    candidateId: string,
  ): Promise<void> {
    await this.findOne(id, organizationId);

    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        sequenceId: id,
        candidateId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.status = EnrollmentStatus.UNSUBSCRIBED;
    await this.enrollmentRepository.save(enrollment);
  }

  async processScheduledEmails(): Promise<void> {
    // Find enrollments that need to send emails
    const dueEnrollments = await this.enrollmentRepository.find({
      where: {
        status: EnrollmentStatus.ACTIVE,
        nextSendAt: LessThanOrEqual(new Date()),
      },
      relations: ['sequence', 'candidate'],
    });

    for (const enrollment of dueEnrollments) {
      try {
        await this.sendSequenceEmail(enrollment);
      } catch (error) {
        console.error(
          `Failed to send email for enrollment ${enrollment.id}:`,
          error,
        );
      }
    }
  }

  private async sendSequenceEmail(
    enrollment: SequenceEnrollment,
  ): Promise<void> {
    const sequence = enrollment.sequence;
    const currentStepIndex = enrollment.currentStep;
    const step = sequence.steps[currentStepIndex];

    if (!step) {
      // No more steps, mark as completed
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
      await this.enrollmentRepository.save(enrollment);

      // Update sequence stats
      sequence.totalCompleted++;
      await this.sequenceRepository.save(sequence);
      return;
    }

    // TODO: Integrate with communication service to actually send email
    // For now, we'll just simulate sending
    console.log(
      `Sending email to ${enrollment.candidate.email}: ${step.subject}`,
    );

    // Update enrollment
    enrollment.emailsSent++;
    enrollment.currentStep++;

    // Calculate next send time
    const nextStepIndex = enrollment.currentStep;
    if (nextStepIndex < sequence.steps.length) {
      const nextStep = sequence.steps[nextStepIndex];
      const nextSendAt = new Date();
      nextSendAt.setDate(nextSendAt.getDate() + nextStep.delayDays);
      nextSendAt.setHours(nextSendAt.getHours() + nextStep.delayHours);
      enrollment.nextSendAt = nextSendAt;
    } else {
      enrollment.nextSendAt = null;
    }

    await this.enrollmentRepository.save(enrollment);
  }

  async recordEmailOpen(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
    });

    if (enrollment) {
      enrollment.emailsOpened++;
      await this.enrollmentRepository.save(enrollment);

      // Update sequence open rate
      await this.updateSequenceMetrics(enrollment.sequenceId);
    }
  }

  async recordEmailClick(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
    });

    if (enrollment) {
      enrollment.emailsClicked++;
      await this.enrollmentRepository.save(enrollment);
    }
  }

  async recordResponse(
    enrollmentId: string,
    sentiment: ResponseSentiment,
  ): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['sequence'],
    });

    if (enrollment) {
      enrollment.repliedAt = new Date();
      enrollment.responseSentiment = sentiment;
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
      await this.enrollmentRepository.save(enrollment);

      // Update sequence stats
      const sequence = enrollment.sequence;
      sequence.totalReplied++;
      await this.sequenceRepository.save(sequence);

      await this.updateSequenceMetrics(enrollment.sequenceId);
    }
  }

  private async updateSequenceMetrics(sequenceId: string): Promise<void> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id: sequenceId },
    });

    if (!sequence) return;

    const enrollments = await this.enrollmentRepository.find({
      where: { sequenceId },
    });

    const totalSent = enrollments.reduce((sum, e) => sum + e.emailsSent, 0);
    const totalOpened = enrollments.reduce((sum, e) => sum + e.emailsOpened, 0);
    const totalReplied = enrollments.filter((e) => e.repliedAt).length;

    sequence.openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    sequence.replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;

    await this.sequenceRepository.save(sequence);
  }
}
