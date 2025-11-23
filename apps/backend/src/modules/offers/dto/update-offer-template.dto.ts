import { PartialType } from '@nestjs/swagger';
import { CreateOfferTemplateDto } from './create-offer-template.dto';

export class UpdateOfferTemplateDto extends PartialType(CreateOfferTemplateDto) {}
