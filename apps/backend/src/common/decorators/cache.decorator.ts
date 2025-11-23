import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';

/**
 * Decorator to enable caching for a method
 * @param key - Cache key pattern (can use {param} placeholders)
 * @param ttl - Time to live in seconds
 */
export const Cacheable = (key: string, ttl: number = 300) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, key)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
    return descriptor;
  };
};

/**
 * Decorator to invalidate cache after method execution
 * @param patterns - Cache key patterns to invalidate
 */
export const CacheInvalidate = (...patterns: string[]) => {
  return SetMetadata('cache:invalidate', patterns);
};
