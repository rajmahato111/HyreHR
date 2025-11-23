import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const cacheTTL = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const resolvedKey = this.resolveKey(cacheKey, request);

    // Try to get from cache
    const cachedData = await this.cacheService.get(resolvedKey);
    if (cachedData !== null) {
      this.logger.debug(`Cache hit for key: ${resolvedKey}`);
      return of(cachedData);
    }

    this.logger.debug(`Cache miss for key: ${resolvedKey}`);

    // Execute handler and cache result
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(resolvedKey, data, cacheTTL);
      }),
    );
  }

  private resolveKey(pattern: string, request: any): string {
    let key = pattern;

    // Replace {param} placeholders with actual values
    const matches = pattern.match(/\{([^}]+)\}/g);
    if (matches) {
      matches.forEach((match) => {
        const paramName = match.slice(1, -1);
        const value = request.params[paramName] || request.query[paramName] || request.user?.[paramName];
        key = key.replace(match, value || '');
      });
    }

    return key;
  }
}
