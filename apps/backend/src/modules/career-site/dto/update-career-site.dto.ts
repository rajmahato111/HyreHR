import { PartialType } from '@nestjs/mapped-types';
import { CreateCareerSiteDto } from './create-career-site.dto';

export class UpdateCareerSiteDto extends PartialType(CreateCareerSiteDto) {}
