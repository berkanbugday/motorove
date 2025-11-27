import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseService } from './firebase.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationsService } from './notifications.service';
import { AuthModule } from '../auth/auth.module';
import { I18nModule } from '../core/i18n/i18n.module';
import { UserBlocksModule } from '../user-blocks/user-blocks.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    AuthModule,
    I18nModule,
    UserBlocksModule,
  ],
  providers: [NotificationsService, FirebaseService, NotificationsResolver],
  exports: [NotificationsService, FirebaseService],
})
export class NotificationsModule {}
