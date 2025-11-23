import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { User } from '../../database/entities/user.entity';

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

@Injectable()
export class MFAService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Generate MFA secret and QR code for enrollment
   */
  async setupMFA(userId: string): Promise<MFASetupResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled for this user');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Recruiting Platform (${user.email})`,
      issuer: 'Recruiting Platform',
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);

    // Store encrypted secret and backup codes (not yet enabled)
    user.mfaSecret = secret.base32;
    user.mfaBackupCodes = backupCodes.map(code => this.hashBackupCode(code));
    await this.userRepository.save(user);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Verify TOTP token and enable MFA
   */
  async enableMFA(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    if (!user.mfaSecret) {
      throw new BadRequestException('MFA setup not initiated. Call setupMFA first');
    }

    // Verify the token
    const isValid = this.verifyToken(user.mfaSecret, token);
    
    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Enable MFA
    user.mfaEnabled = true;
    user.mfaEnrolledAt = new Date();
    await this.userRepository.save(user);
  }

  /**
   * Disable MFA for a user
   */
  async disableMFA(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.mfaEnabled) {
      throw new BadRequestException('MFA is not enabled');
    }

    // Verify the token before disabling
    const isValid = this.verifyToken(user.mfaSecret, token);
    
    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Disable MFA
    user.mfaEnabled = false;
    user.mfaSecret = null;
    user.mfaBackupCodes = null;
    user.mfaEnrolledAt = null;
    await this.userRepository.save(user);
  }

  /**
   * Verify MFA token during login
   */
  async verifyMFAToken(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException('MFA not configured');
    }

    // Try TOTP token first
    if (this.verifyToken(user.mfaSecret, token)) {
      return true;
    }

    // Try backup codes
    if (await this.verifyBackupCode(user, token)) {
      return true;
    }

    return false;
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string, token: string): Promise<string[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.mfaEnabled) {
      throw new BadRequestException('MFA is not enabled');
    }

    // Verify the token before regenerating
    const isValid = this.verifyToken(user.mfaSecret, token);
    
    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(10);
    user.mfaBackupCodes = backupCodes.map(code => this.hashBackupCode(code));
    await this.userRepository.save(user);

    return backupCodes;
  }

  /**
   * Verify TOTP token
   */
  private verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before and after
    });
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * Hash backup code for storage
   */
  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify and consume backup code
   */
  private async verifyBackupCode(user: User, code: string): Promise<boolean> {
    if (!user.mfaBackupCodes || user.mfaBackupCodes.length === 0) {
      return false;
    }

    const hashedCode = this.hashBackupCode(code);
    const index = user.mfaBackupCodes.indexOf(hashedCode);
    
    if (index === -1) {
      return false;
    }

    // Remove used backup code
    user.mfaBackupCodes.splice(index, 1);
    await this.userRepository.save(user);
    
    return true;
  }

  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'mfaEnabled']
    });
    
    return user?.mfaEnabled || false;
  }
}
