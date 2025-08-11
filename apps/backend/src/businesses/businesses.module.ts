import { Module } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { BusinessesResolver } from './businesses.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [BusinessesResolver, BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
