import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditLogService } from '../services/audit-log.service';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogMetadata {
  action: string;
  entityType: string;
  getEntityId?: (result: any) => string;
  includeChanges?: boolean;
}

export const AuditLog = (metadata: AuditLogMetadata) =>
  Reflect.metadata(AUDIT_LOG_KEY, metadata);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = user?.organizationId;

    if (!organizationId) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const entityId = metadata.getEntityId
            ? metadata.getEntityId(result)
            : result?.id;

          const changes = metadata.includeChanges
            ? {
                before: request.body?._original,
                after: result,
              }
            : undefined;

          await this.auditLogService.log({
            organizationId,
            userId: user?.id,
            action: metadata.action,
            entityType: metadata.entityType,
            entityId,
            changes,
            metadata: {
              method: request.method,
              url: request.url,
              params: request.params,
            },
            ipAddress: request.ip,
            userAgent: request.get('user-agent'),
          });
        } catch (error) {
          // Log error but don't fail the request
          console.error('Failed to create audit log:', error);
        }
      }),
    );
  }
}
