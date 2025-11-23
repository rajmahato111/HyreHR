import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const masterKey = this.configService.get<string>('ENCRYPTION_KEY');
    
    if (!masterKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // Derive a 32-byte key from the master key
    this.key = createHash('sha256').update(masterKey).digest();
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text: string): string {
    if (!text) {
      return text;
    }

    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Format: iv:authTag:encrypted
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    if (!encryptedData) {
      return encryptedData;
    }

    try {
      const parts = encryptedData.split(':');
      
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, authTagHex, encrypted] = parts;

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = createDecipheriv(this.algorithm, this.key, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Hash data (one-way, for comparison)
   */
  hash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  /**
   * Encrypt object fields
   */
  encryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
  ): T {
    const result = { ...obj };

    for (const field of fields) {
      if (result[field] && typeof result[field] === 'string') {
        result[field] = this.encrypt(result[field] as string) as any;
      }
    }

    return result;
  }

  /**
   * Decrypt object fields
   */
  decryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
  ): T {
    const result = { ...obj };

    for (const field of fields) {
      if (result[field] && typeof result[field] === 'string') {
        try {
          result[field] = this.decrypt(result[field] as string) as any;
        } catch (error) {
          // If decryption fails, leave the field as is
          console.error(`Failed to decrypt field ${String(field)}:`, error.message);
        }
      }
    }

    return result;
  }

  /**
   * Anonymize data for GDPR compliance
   */
  anonymize(text: string): string {
    // Create a deterministic hash for anonymization
    // This allows for consistent anonymization while being irreversible
    return `anon_${this.hash(text).substring(0, 16)}`;
  }

  /**
   * Anonymize email
   */
  anonymizeEmail(email: string): string {
    const hash = this.hash(email).substring(0, 16);
    return `deleted_${hash}@anonymized.com`;
  }

  /**
   * Mask sensitive data for display (e.g., credit card, SSN)
   */
  mask(text: string, visibleChars: number = 4): string {
    if (!text || text.length <= visibleChars) {
      return text;
    }

    const masked = '*'.repeat(text.length - visibleChars);
    return masked + text.slice(-visibleChars);
  }
}
