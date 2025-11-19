import { Module } from '@nestjs/common';
import { UserLocationsService } from './user-locations.service';
import { UserLocationsResolver } from './user-locations.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UserLocationsResolver, UserLocationsService],
  exports: [UserLocationsService],
})
export class UserLocationsModule {}
