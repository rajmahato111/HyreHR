import { PartialType } from '@nestjs/mapped-types';
import { CreateTalentPoolDto } from './create-talent-pool.dto';

export class UpdateTalentPoolDto extends PartialType(CreateTalentPoolDto) {}
