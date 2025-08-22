import { Module } from '@nestjs/common';
import { ProfanityFilterService } from './profanity-filter.service';

@Module({
  providers: [ProfanityFilterService],
  exports: [ProfanityFilterService],
})
export class ProfanityFilterModule {}
