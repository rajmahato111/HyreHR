import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationFormDto } from './create-application-form.dto';

export class UpdateApplicationFormDto extends PartialType(CreateApplicationFormDto) {}
