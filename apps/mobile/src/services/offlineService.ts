import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_KEYS } from '@/config/constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn?: number; // milliseconds
}

class OfflineService {
  /**
   * Save data to cache
   */
  async setCache<T>(key: string, data: T, expiresIn?: number): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };

    try {
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  /**
   * Get data from cache
   */
  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);

      // Check if cache has expired
      if (cacheItem.expiresIn) {
        const age = Date.now() - cacheItem.timestamp;
        if (age > cacheItem.expiresIn) {
          await this.removeCache(key);
          return null;
        }
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Failed to get from cache:', error);
      return null;
    }
  }

  /**
   * Remove data from cache
   */
  async removeCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Cache applications data
   */
  async cacheApplications(applications: any[]): Promise<void> {
    await this.setCache(CACHE_KEYS.APPLICATIONS, applications, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Get cached applications
   */
  async getCachedApplications(): Promise<any[] | null> {
    return this.getCache<any[]>(CACHE_KEYS.APPLICATIONS);
  }

  /**
   * Cache interviews data
   */
  async cacheInterviews(interviews: any[]): Promise<void> {
    await this.setCache(CACHE_KEYS.INTERVIEWS, interviews, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Get cached interviews
   */
  async getCachedInterviews(): Promise<any[] | null> {
    return this.getCache<any[]>(CACHE_KEYS.INTERVIEWS);
  }

  /**
   * Cache user data
   */
  async cacheUser(user: any): Promise<void> {
    await this.setCache(CACHE_KEYS.USER, user);
  }

  /**
   * Get cached user
   */
  async getCachedUser(): Promise<any | null> {
    return this.getCache<any>(CACHE_KEYS.USER);
  }

  /**
   * Check if data is stale (older than specified time)
   */
  async isCacheStale(key: string, maxAge: number): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return true;

      const cacheItem: CacheItem<any> = JSON.parse(cached);
      const age = Date.now() - cacheItem.timestamp;
      return age > maxAge;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get cache age in milliseconds
   */
  async getCacheAge(key: string): Promise<number | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<any> = JSON.parse(cached);
      return Date.now() - cacheItem.timestamp;
    } catch (error) {
      return null;
    }
  }
}

export const offlineService = new OfflineService();
