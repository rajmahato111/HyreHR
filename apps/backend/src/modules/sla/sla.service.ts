import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlaRule, SlaViolation } from '../../database/entities';
import {
  CreateSlaRuleDto,
  UpdateSlaRuleDto,
  FilterSlaRuleDto,
  FilterViolationDto,
} from './dto';

@Injectable()
export class SlaService {
  constructor(
    @InjectRepository(SlaRule)
    private slaRuleRepository: Repository<SlaRule>,
    @InjectRepository(SlaViolation)
    private slaViolationRepository: Repository<SlaViolation>,
  ) {}

  async createRule(
    organizationId: string,
    createDto: CreateSlaRuleDto,
  ): Promise<SlaRule> {
    const rule = this.slaRuleRepository.create({
      ...createDto,
      organizationId,
    });

    return this.slaRuleRepository.save(rule);
  }

  async findAllRules(
    organizationId: string,
    filters: FilterSlaRuleDto,
  ): Promise<SlaRule[]> {
    const query = this.slaRuleRepository
      .createQueryBuilder('rule')
      .where('rule.organizationId = :organizationId', { organizationId });

    if (filters.type) {
      query.andWhere('rule.type = :type', { type: filters.type });
    }

    if (filters.active !== undefined) {
      query.andWhere('rule.active = :active', { active: filters.active });
    }

    if (filters.jobId) {
      query.andWhere(
        '(rule.jobIds IS NULL OR :jobId = ANY(rule.jobIds))',
        { jobId: filters.jobId },
      );
    }

    if (filters.departmentId) {
      query.andWhere(
        '(rule.departmentIds IS NULL OR :departmentId = ANY(rule.departmentIds))',
        { departmentId: filters.departmentId },
      );
    }

    query.orderBy('rule.createdAt', 'DESC');

    return query.getMany();
  }

  async findRuleById(id: string, organizationId: string): Promise<SlaRule> {
    const rule = await this.slaRuleRepository.findOne({
      where: { id, organizationId },
    });

    if (!rule) {
      throw new NotFoundException(`SLA rule with ID ${id} not found`);
    }

    return rule;
  }

  async updateRule(
    id: string,
    organizationId: string,
    updateDto: UpdateSlaRuleDto,
  ): Promise<SlaRule> {
    const rule = await this.findRuleById(id, organizationId);

    Object.assign(rule, updateDto);

    return this.slaRuleRepository.save(rule);
  }

  async deleteRule(id: string, organizationId: string): Promise<void> {
    const rule = await this.findRuleById(id, organizationId);
    await this.slaRuleRepository.remove(rule);
  }

  async findActiveRulesForEntity(
    organizationId: string,
    jobId?: string,
    departmentId?: string,
  ): Promise<SlaRule[]> {
    const query = this.slaRuleRepository
      .createQueryBuilder('rule')
      .where('rule.organizationId = :organizationId', { organizationId })
      .andWhere('rule.active = :active', { active: true });

    // Rules apply if:
    // 1. No specific jobs/departments configured (applies to all)
    // 2. The specific job/department is in the list
    if (jobId) {
      query.andWhere(
        '(rule.jobIds IS NULL OR :jobId = ANY(rule.jobIds))',
        { jobId },
      );
    }

    if (departmentId) {
      query.andWhere(
        '(rule.departmentIds IS NULL OR :departmentId = ANY(rule.departmentIds))',
        { departmentId },
      );
    }

    return query.getMany();
  }

  async findAllViolations(
    organizationId: string,
    filters: FilterViolationDto,
  ): Promise<SlaViolation[]> {
    const query = this.slaViolationRepository
      .createQueryBuilder('violation')
      .leftJoinAndSelect('violation.slaRule', 'rule')
      .where('rule.organizationId = :organizationId', { organizationId });

    if (filters.slaRuleId) {
      query.andWhere('violation.slaRuleId = :slaRuleId', {
        slaRuleId: filters.slaRuleId,
      });
    }

    if (filters.entityType) {
      query.andWhere('violation.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.entityId) {
      query.andWhere('violation.entityId = :entityId', {
        entityId: filters.entityId,
      });
    }

    if (filters.status) {
      query.andWhere('violation.status = :status', { status: filters.status });
    }

    if (filters.escalated !== undefined) {
      query.andWhere('violation.escalated = :escalated', {
        escalated: filters.escalated,
      });
    }

    query.orderBy('violation.violatedAt', 'DESC');

    return query.getMany();
  }

  async findViolationById(
    id: string,
    organizationId: string,
  ): Promise<SlaViolation> {
    const violation = await this.slaViolationRepository
      .createQueryBuilder('violation')
      .leftJoinAndSelect('violation.slaRule', 'rule')
      .where('violation.id = :id', { id })
      .andWhere('rule.organizationId = :organizationId', { organizationId })
      .getOne();

    if (!violation) {
      throw new NotFoundException(`SLA violation with ID ${id} not found`);
    }

    return violation;
  }

  async getComplianceMetrics(
    organizationId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const query = this.slaViolationRepository
      .createQueryBuilder('violation')
      .leftJoin('violation.slaRule', 'rule')
      .where('rule.organizationId = :organizationId', { organizationId });

    if (startDate) {
      query.andWhere('violation.violatedAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('violation.violatedAt <= :endDate', { endDate });
    }

    const violations = await query.getMany();

    // Get all rules to calculate compliance
    const rules = await this.slaRuleRepository.find({
      where: { organizationId, active: true },
    });

    // Calculate metrics per rule type
    const metricsByType: Record<string, any> = {};

    for (const rule of rules) {
      const ruleViolations = violations.filter(
        (v) => v.slaRuleId === rule.id,
      );

      if (!metricsByType[rule.type]) {
        metricsByType[rule.type] = {
          type: rule.type,
          totalViolations: 0,
          openViolations: 0,
          escalatedViolations: 0,
          averageDelayHours: 0,
        };
      }

      metricsByType[rule.type].totalViolations += ruleViolations.length;
      metricsByType[rule.type].openViolations += ruleViolations.filter(
        (v) => v.status === 'open',
      ).length;
      metricsByType[rule.type].escalatedViolations += ruleViolations.filter(
        (v) => v.escalated,
      ).length;

      if (ruleViolations.length > 0) {
        const totalDelay = ruleViolations.reduce(
          (sum, v) => sum + Number(v.actualHours),
          0,
        );
        metricsByType[rule.type].averageDelayHours =
          totalDelay / ruleViolations.length;
      }
    }

    return {
      summary: {
        totalViolations: violations.length,
        openViolations: violations.filter((v) => v.status === 'open').length,
        resolvedViolations: violations.filter((v) => v.status === 'resolved')
          .length,
        escalatedViolations: violations.filter((v) => v.escalated).length,
      },
      byType: Object.values(metricsByType),
    };
  }
}
