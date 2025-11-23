import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async check() {
    return this.healthService.check();
  }

  @Public()
  @Get('ready')
  async ready() {
    return this.healthService.readiness();
  }

  @Public()
  @Get('live')
  async live() {
    return this.healthService.liveness();
  }
}
