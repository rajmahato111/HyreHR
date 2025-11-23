import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Offer,
  OfferStatus,
  ApprovalStatus,
  OfferApprover,
  OfferTemplate,
  Application,
  ApplicationStatus,
} from '../../database/entities';
import {
  CreateOfferDto,
  UpdateOfferDto,
  ApproveOfferDto,
  RejectOfferDto,
  SendOfferDto,
} from './dto';
import { DocuSignService } from './docusign.service';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(OfferTemplate)
    private offerTemplateRepository: Repository<OfferTemplate>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private docuSignService: DocuSignService,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: string): Promise<Offer> {
    // Verify application exists and is in appropriate status
    const application = await this.applicationRepository.findOne({
      where: { id: createOfferDto.applicationId },
      relations: ['candidate', 'job'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException('Cannot create offer for rejected application');
    }

    // Check if offer already exists for this application
    const existingOffer = await this.offerRepository.findOne({
      where: { applicationId: createOfferDto.applicationId },
    });

    if (existingOffer && existingOffer.status !== OfferStatus.WITHDRAWN) {
      throw new BadRequestException('Offer already exists for this application');
    }

    // Initialize approval workflow if provided
    let approvalWorkflow: OfferApprover[] | undefined;
    if (createOfferDto.approvalWorkflow && createOfferDto.approvalWorkflow.length > 0) {
      approvalWorkflow = createOfferDto.approvalWorkflow.map((approver) => ({
        userId: approver.userId,
        order: approver.order,
        status: ApprovalStatus.PENDING,
      }));
    }

    // Calculate expiry date
    const expiryDays = createOfferDto.expiryDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const offer = this.offerRepository.create({
      ...createOfferDto,
      status: approvalWorkflow ? OfferStatus.PENDING_APPROVAL : OfferStatus.DRAFT,
      approvalWorkflow,
      expiresAt,
      currency: createOfferDto.currency || 'USD',
    });

    return this.offerRepository.save(offer);
  }

  async findAll(organizationId: string): Promise<Offer[]> {
    return this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.application', 'application')
      .leftJoinAndSelect('application.candidate', 'candidate')
      .leftJoinAndSelect('application.job', 'job')
      .where('application.job.organizationId = :organizationId', { organizationId })
      .orderBy('offer.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['application', 'application.candidate', 'application.job'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async findByApplication(applicationId: string): Promise<Offer | null> {
    return this.offerRepository.findOne({
      where: { applicationId },
      relations: ['application', 'application.candidate', 'application.job'],
    });
  }

  async update(id: string, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);

    // Only allow updates to draft or pending approval offers
    if (![OfferStatus.DRAFT, OfferStatus.PENDING_APPROVAL].includes(offer.status)) {
      throw new BadRequestException('Cannot update offer in current status');
    }

    Object.assign(offer, updateOfferDto);

    return this.offerRepository.save(offer);
  }

  async approve(id: string, userId: string, approveDto: ApproveOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);

    if (offer.status !== OfferStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Offer is not pending approval');
    }

    if (!offer.approvalWorkflow || offer.approvalWorkflow.length === 0) {
      throw new BadRequestException('No approval workflow configured');
    }

    // Find the current approver
    const currentApprover = offer.approvalWorkflow.find(
      (approver) => approver.userId === userId && approver.status === ApprovalStatus.PENDING,
    );

    if (!currentApprover) {
      throw new ForbiddenException('You are not authorized to approve this offer');
    }

    // Update approver status
    currentApprover.status = ApprovalStatus.APPROVED;
    currentApprover.approvedAt = new Date();
    currentApprover.comments = approveDto.comments;

    // Check if all approvers have approved
    const allApproved = offer.approvalWorkflow.every(
      (approver) => approver.status === ApprovalStatus.APPROVED,
    );

    if (allApproved) {
      offer.status = OfferStatus.APPROVED;
    }

    return this.offerRepository.save(offer);
  }

  async reject(id: string, userId: string, rejectDto: RejectOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);

    if (offer.status !== OfferStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Offer is not pending approval');
    }

    if (!offer.approvalWorkflow || offer.approvalWorkflow.length === 0) {
      throw new BadRequestException('No approval workflow configured');
    }

    // Find the current approver
    const currentApprover = offer.approvalWorkflow.find(
      (approver) => approver.userId === userId && approver.status === ApprovalStatus.PENDING,
    );

    if (!currentApprover) {
      throw new ForbiddenException('You are not authorized to reject this offer');
    }

    // Update approver status
    currentApprover.status = ApprovalStatus.REJECTED;
    currentApprover.rejectedAt = new Date();
    currentApprover.comments = rejectDto.comments;

    // Set offer status to draft for revision
    offer.status = OfferStatus.DRAFT;

    return this.offerRepository.save(offer);
  }

  async send(id: string, sendDto: SendOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);

    // Only approved offers can be sent
    if (offer.status !== OfferStatus.APPROVED) {
      throw new BadRequestException('Only approved offers can be sent');
    }

    offer.status = OfferStatus.SENT;
    offer.sentAt = new Date();

    return this.offerRepository.save(offer);
  }

  async sendWithDocuSign(id: string, sendDto: SendOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);

    // Only approved offers can be sent
    if (offer.status !== OfferStatus.APPROVED) {
      throw new BadRequestException('Only approved offers can be sent');
    }

    try {
      // Generate offer document (in production, use a proper PDF generator)
      const offerDocument = await this.generateOfferDocument(offer);

      // Send via DocuSign
      const envelopeId = await this.docuSignService.createEnvelope(
        {
          documentBase64: offerDocument,
          name: `Offer Letter - ${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`,
          fileExtension: 'pdf',
          documentId: '1',
        },
        [
          {
            email: offer.application.candidate.email,
            name: `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`,
            recipientId: '1',
            routingOrder: '1',
          },
        ],
        `Offer Letter - ${offer.jobTitle}`,
        sendDto.message,
      );

      offer.docusignEnvelopeId = envelopeId;
      offer.docusignStatus = 'sent';
      offer.status = OfferStatus.SENT;
      offer.sentAt = new Date();

      this.logger.log(`Offer ${id} sent via DocuSign with envelope ${envelopeId}`);

      return this.offerRepository.save(offer);
    } catch (error) {
      this.logger.error(`Failed to send offer ${id} via DocuSign`, error);
      throw new BadRequestException('Failed to send offer via DocuSign');
    }
  }

  private async generateOfferDocument(offer: Offer): Promise<string> {
    // In production, use a proper PDF generator like PDFKit or Puppeteer
    // For now, return a placeholder base64 string
    const content = `
      Offer Letter
      
      Dear ${offer.application.candidate.firstName} ${offer.application.candidate.lastName},
      
      We are pleased to offer you the position of ${offer.jobTitle}.
      
      Compensation:
      - Base Salary: ${offer.currency} ${offer.salary.toLocaleString()}
      ${offer.bonus ? `- Bonus: ${offer.currency} ${offer.bonus.toLocaleString()}` : ''}
      ${offer.equity ? `- Equity: ${offer.equity.amount} ${offer.equity.type}` : ''}
      
      Start Date: ${offer.startDate ? offer.startDate.toLocaleDateString() : 'To be determined'}
      
      ${offer.benefits ? `Benefits:\n${offer.benefits}` : ''}
      
      Please sign below to accept this offer.
      
      Sincerely,
      The Hiring Team
    `;

    // Convert to base64 (in production, generate actual PDF)
    return Buffer.from(content).toString('base64');
  }

  async updateDocuSignStatus(envelopeId: string, status: string): Promise<void> {
    const offer = await this.offerRepository.findOne({
      where: { docusignEnvelopeId: envelopeId },
    });

    if (!offer) {
      this.logger.warn(`No offer found for DocuSign envelope ${envelopeId}`);
      return;
    }

    offer.docusignStatus = status;

    // Update offer status based on DocuSign status
    if (status === 'completed') {
      offer.status = OfferStatus.ACCEPTED;
      offer.acceptedAt = new Date();

      // Update application status
      const application = await this.applicationRepository.findOne({
        where: { id: offer.applicationId },
      });

      if (application) {
        application.status = ApplicationStatus.HIRED;
        application.hiredAt = new Date();
        await this.applicationRepository.save(application);
      }
    } else if (status === 'declined' || status === 'voided') {
      offer.status = OfferStatus.DECLINED;
      offer.declinedAt = new Date();
    }

    await this.offerRepository.save(offer);
    this.logger.log(`Updated offer ${offer.id} status based on DocuSign status: ${status}`);
  }

  async accept(id: string): Promise<Offer> {
    const offer = await this.findOne(id);

    if (offer.status !== OfferStatus.SENT) {
      throw new BadRequestException('Offer must be sent before it can be accepted');
    }

    // Check if offer has expired
    if (offer.expiresAt && new Date() > offer.expiresAt) {
      offer.status = OfferStatus.EXPIRED;
      await this.offerRepository.save(offer);
      throw new BadRequestException('Offer has expired');
    }

    offer.status = OfferStatus.ACCEPTED;
    offer.acceptedAt = new Date();

    // Update application status to hired
    const application = await this.applicationRepository.findOne({
      where: { id: offer.applicationId },
    });

    if (application) {
      application.status = ApplicationStatus.HIRED;
      application.hiredAt = new Date();
      await this.applicationRepository.save(application);
    }

    return this.offerRepository.save(offer);
  }

  async decline(id: string): Promise<Offer> {
    const offer = await this.findOne(id);

    if (offer.status !== OfferStatus.SENT) {
      throw new BadRequestException('Offer must be sent before it can be declined');
    }

    offer.status = OfferStatus.DECLINED;
    offer.declinedAt = new Date();

    return this.offerRepository.save(offer);
  }

  async withdraw(id: string): Promise<Offer> {
    const offer = await this.findOne(id);

    if ([OfferStatus.ACCEPTED, OfferStatus.DECLINED].includes(offer.status)) {
      throw new BadRequestException('Cannot withdraw accepted or declined offer');
    }

    offer.status = OfferStatus.WITHDRAWN;
    offer.withdrawnAt = new Date();

    return this.offerRepository.save(offer);
  }

  async delete(id: string): Promise<void> {
    const offer = await this.findOne(id);

    // Only allow deletion of draft offers
    if (offer.status !== OfferStatus.DRAFT) {
      throw new BadRequestException('Only draft offers can be deleted');
    }

    await this.offerRepository.remove(offer);
  }

  // Check and update expired offers
  async checkExpiredOffers(): Promise<void> {
    const expiredOffers = await this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.status = :status', { status: OfferStatus.SENT })
      .andWhere('offer.expiresAt < :now', { now: new Date() })
      .getMany();

    for (const offer of expiredOffers) {
      offer.status = OfferStatus.EXPIRED;
      await this.offerRepository.save(offer);
    }
  }
}
