import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache: Map<string, { value: string; expiry: number }> = new Map();

  constructor(private configService: ConfigService) {
    this.logger.log('Initialized In-Memory Cache Service');
    // Start cleanup interval
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (data.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * L1 Cache: Short-lived cache for frequently accessed data (5 minutes)
   */
  async cacheUser(userId: string, user: any, ttl = 300): Promise<void> {
    this.set(`user:${userId}`, user, ttl);
  }

  async getUser(userId: string): Promise<any | null> {
    return this.get(`user:${userId}`);
  }

  /**
   * L2 Cache: Medium-lived cache for computed data (15 minutes)
   */
  async cacheJobApplications(
    jobId: string,
    applications: any[],
    ttl = 900,
  ): Promise<void> {
    this.set(`job:${jobId}:applications`, applications, ttl);
  }

  async getJobApplications(jobId: string): Promise<any[] | null> {
    return this.get(`job:${jobId}:applications`);
  }

  /**
   * L3 Cache: Long-lived cache for analytics (1 hour)
   */
  async cacheDashboardData(
    dashboardId: string,
    data: any,
    ttl = 3600,
  ): Promise<void> {
    this.set(`dashboard:${dashboardId}`, data, ttl);
  }

  async getDashboardData(dashboardId: string): Promise<any | null> {
    return this.get(`dashboard:${dashboardId}`);
  }

  /**
   * Generic cache methods
   */
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      this.cache.set(key, {
        value: serialized,
        expiry: Date.now() + ttl * 1000,
      });
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = this.cache.get(key);
      if (!data) return null;

      if (data.expiry < Date.now()) {
        this.cache.delete(key);
        return null;
      }

      return JSON.parse(data.value);
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}`, error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Cache invalidation
   */
  async invalidateJobCache(jobId: string): Promise<void> {
    this.invalidatePattern(`job:${jobId}:`);
  }

  async invalidateCandidateCache(candidateId: string): Promise<void> {
    this.invalidatePattern(`candidate:${candidateId}:`);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Simple prefix matching for in-memory cache
    // Convert redis pattern (e.g. "job:123:*") to regex or prefix check
    const prefix = pattern.replace('*', '');
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cache warming for frequently accessed data
   */
  async warmCache(organizationId: string): Promise<void> {
    this.logger.log(`Warming cache for organization ${organizationId}`);
    // Implementation would fetch and cache frequently accessed data
    // This is a placeholder for the actual implementation
  }

  async onModuleDestroy() {
    this.cache.clear();
  }
}
