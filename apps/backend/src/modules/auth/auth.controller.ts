import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, AuthResponse } from './auth.service';
import { MFAService } from './mfa.service';
import { RegisterDto, LoginDto, RefreshTokenDto, VerifyMFADto, MFALoginDto } from './dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { User } from '../../database/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MFAService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions,
      organizationId: user.organizationId,
      timezone: user.timezone,
      locale: user.locale,
      avatarUrl: user.avatarUrl,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    return {
      message: 'Logged out successfully',
    };
  }

  // MFA Endpoints
  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  async setupMFA(@CurrentUser() user: User) {
    return this.mfaService.setupMFA(user.id);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enableMFA(@CurrentUser() user: User, @Body() verifyDto: VerifyMFADto) {
    await this.mfaService.enableMFA(user.id, verifyDto.token);
    return {
      message: 'MFA enabled successfully',
      mfaEnabled: true,
    };
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disableMFA(@CurrentUser() user: User, @Body() verifyDto: VerifyMFADto) {
    await this.mfaService.disableMFA(user.id, verifyDto.token);
    return {
      message: 'MFA disabled successfully',
      mfaEnabled: false,
    };
  }

  @Post('mfa/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  async verifyMFA(@Body() mfaLoginDto: MFALoginDto): Promise<AuthResponse> {
    const isValid = await this.mfaService.verifyMFAToken(
      mfaLoginDto.userId,
      mfaLoginDto.token,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    return this.authService.completeMFALogin(mfaLoginDto.userId, mfaLoginDto.token);
  }

  @Post('mfa/backup-codes/regenerate')
  @UseGuards(JwtAuthGuard)
  async regenerateBackupCodes(@CurrentUser() user: User, @Body() verifyDto: VerifyMFADto) {
    const backupCodes = await this.mfaService.regenerateBackupCodes(
      user.id,
      verifyDto.token,
    );
    return {
      backupCodes,
      message: 'Backup codes regenerated successfully',
    };
  }

  @Get('mfa/status')
  @UseGuards(JwtAuthGuard)
  async getMFAStatus(@CurrentUser() user: User) {
    return {
      mfaEnabled: user.mfaEnabled,
      mfaEnrolledAt: user.mfaEnrolledAt,
    };
  }

  // Google OAuth
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.handleOAuthLogin(req.user);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`,
    );
  }
}
