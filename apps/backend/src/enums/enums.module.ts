import { Module } from '@nestjs/common';
import { EnumsResolver } from './enums.resolver';

@Module({
  providers: [EnumsResolver],
})
export class EnumsModule {}
