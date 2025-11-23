import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { AuditLog, AuditAction } from '../../database/entities/audit-log.entity';

export interface CreateAuditLogDto {
  organizationId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters {
  organizationId: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  actions?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create an audit log entry
   */
  async log(data: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      organizationId: data.organizationId,
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      changes: data.changes,
      metadata: data.metadata,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit logs with filters
   */
  async findAll(filters: AuditLogFilters): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: filters.organizationId,
    };

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.actions && filters.actions.length > 0) {
      where.action = In(filters.actions);
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = Between(
        filters.startDate || new Date(0),
        filters.endDate || new Date(),
      );
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      relations: ['user'],
      order: {
        timestamp: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get audit log by ID
   */
  async findOne(id: string, organizationId: string): Promise<AuditLog> {
    return this.auditLogRepository.findOne({
      where: { id, organizationId },
      relations: ['user'],
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async findByEntity(
    entityType: string,
    entityId: string,
    organizationId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        entityType,
        entityId,
        organizationId,
      },
      relations: ['user'],
      order: {
        timestamp: 'DESC',
      },
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async findByUser(
    userId: string,
    organizationId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        userId,
        organizationId,
      },
      order: {
        timestamp: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get recent audit logs
   */
  async findRecent(organizationId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        organizationId,
      },
      relations: ['user'],
      order: {
        timestamp: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(
    organizationId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
    byUser: Record<string, number>;
  }> {
    const where: any = {
      organizationId,
    };

    if (startDate || endDate) {
      where.timestamp = Between(
        startDate || new Date(0),
        endDate || new Date(),
      );
    }

    const logs = await this.auditLogRepository.find({ where });

    const byAction: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};
    const byUser: Record<string, number> = {};

    logs.forEach((log) => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
      if (log.userId) {
        byUser[log.userId] = (byUser[log.userId] || 0) + 1;
      }
    });

    return {
      totalLogs: logs.length,
      byAction,
      byEntityType,
      byUser,
    };
  }

  /**
   * Delete old audit logs (for data retention)
   */
  async deleteOldLogs(organizationId: string, olderThan: Date): Promise<number> {
    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('organization_id = :organizationId', { organizationId })
      .andWhere('timestamp < :olderThan', { olderThan })
      .execute();

    return result.affected || 0;
  }
}
