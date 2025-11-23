import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { AuditLogService, AuditLogFilters } from '../../common/services/audit-log.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermissions('audit:view')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: User,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('actions') actions?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: AuditLogFilters = {
      organizationId: user.organizationId,
      userId,
      entityType,
      entityId,
      action,
      actions: actions ? actions.split(',') : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    };

    return this.auditLogService.findAll(filters);
  }

  @Get('recent')
  @RequirePermissions('audit:view')
  @HttpCode(HttpStatus.OK)
  async findRecent(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const logs = await this.auditLogService.findRecent(user.organizationId, limitNum);
    
    return {
      data: logs,
      total: logs.length,
    };
  }

  @Get('statistics')
  @RequirePermissions('audit:view')
  @HttpCode(HttpStatus.OK)
  async getStatistics(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditLogService.getStatistics(
      user.organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('audit:view')
  @HttpCode(HttpStatus.OK)
  async findByEntity(
    @CurrentUser() user: User,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const logs = await this.auditLogService.findByEntity(
      entityType,
      entityId,
      user.organizationId,
    );
    
    return {
      data: logs,
      total: logs.length,
    };
  }

  @Get('user/:userId')
  @RequirePermissions('audit:view')
  @HttpCode(HttpStatus.OK)
  async findByUser(
    @CurrentUser() user: User,
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    const logs = await this.auditLogService.findByUser(
      userId,
      user.organizationId,
      limitNum,
    );
    
    return {
      data: logs,
      total: logs.length,
    };
  }

  @Get(':id')
  @RequirePermissions('audit:view')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.auditLogService.findOne(id, user.organizationId);
  }
}
