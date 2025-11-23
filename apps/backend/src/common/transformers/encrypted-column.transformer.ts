import { ValueTransformer } from 'typeorm';
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * TypeORM transformer for automatic encryption/decryption of column values
 * 
 * Usage:
 * @Column({
 *   type: 'text',
 *   transformer: new EncryptedColumnTransformer()
 * })
 * ssn: string;
 */
export class EncryptedColumnTransformer implements ValueTransformer {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const masterKey = process.env.ENCRYPTION_KEY;
    
    if (!masterKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // Derive a 32-byte key from the master key
    this.key = createHash('sha256').update(masterKey).digest();
  }

  /**
   * Encrypt value before storing in database
   */
  to(value: string | null): string | null {
    if (!value) {
      return value;
    }

    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Format: iv:authTag:encrypted
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  /**
   * Decrypt value after reading from database
   */
  from(value: string | null): string | null {
    if (!value) {
      return value;
    }

    try {
      const parts = value.split(':');
      
      if (parts.length !== 3) {
        // Value might not be encrypted (legacy data)
        return value;
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
      console.error('Decryption failed:', error);
      // Return null or original value on decryption failure
      return null;
    }
  }
}
