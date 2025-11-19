import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { ConfigService } from './core/config/config.service';
import { GroupsModule } from './groups/groups.module';
import { GroupMembershipsModule } from './group-memberships/group-memberships.module';
import { EnumsModule } from './enums/enums.module';
import { CitiesModule } from './cities/cities.module';
import { GraphqlExceptionFilter } from './core/filters/graphql-exception.filter';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { PostCommentsModule } from './post-comments/post-comments.module';
import { UserFollowingsModule } from './user-followings/user-followings.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { BusinessesModule } from './businesses/businesses.module';
import { BusinessCommentsModule } from './business-comments/business-comments.module';
import { SupportsModule } from './supports/supports.module';
import { WarningsModule } from './warnings/warnings.module';
import { EmergenciesModule } from './emergencies/emergencies.module';
import { UserLocationsModule } from './user-locations/user-locations.module';

@Module({
  imports: [
    CoreModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [CoreModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.isDevelopment(),
        introspection: configService.isDevelopment(),
        bodyParserConfig: {
          limit: '50mb',
        },
        formatError: (error) => {
          // Only return stacktrace in development mode
          const isDev = configService.isDevelopment();
          const { extensions = {}, ...rest } = error;

          // If we're not in development, strip out sensitive information
          const hasStacktrace =
            extensions.exception &&
            typeof extensions.exception === 'object' &&
            extensions.exception !== null &&
            'stacktrace' in extensions.exception;

          if (!isDev && hasStacktrace) {
            return {
              ...rest,
              extensions: {
                code: extensions.code,
              },
            };
          }

          return error;
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    GroupsModule,
    GroupMembershipsModule,
    EnumsModule,
    CitiesModule,
    NotificationsModule,
    PostsModule,
    PostCommentsModule,
    UserFollowingsModule,
    UsersModule,
    EventsModule,
    UserSettingsModule,
    BusinessesModule,
    BusinessCommentsModule,
    SupportsModule,
    WarningsModule,
    EmergenciesModule,
    UserLocationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GraphqlExceptionFilter,
    },
  ],
})
export class AppModule {}
