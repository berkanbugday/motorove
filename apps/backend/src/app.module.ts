import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { ConfigService } from './core/config/config.service';
import { GroupsModule } from './groups/groups.module';
import { GroupMembershipsModule } from './group-memberships/group-memberships.module';
import { EnumsModule } from './enums/enums.module';

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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
