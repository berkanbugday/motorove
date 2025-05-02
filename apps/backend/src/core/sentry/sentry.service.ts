import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { ConfigService } from '../config/config.service';
@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.initializeSentry();
  }

  private initializeSentry(): void {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.getEnvironment();

    if (!dsn) {
      this.logger.warn(
        'Sentry DSN not provided. Sentry will not be initialized.',
      );
      return;
    }

    Sentry.init({
      dsn,
      environment,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      integrations: [nodeProfilingIntegration()],
    });

    this.logger.log(`Sentry initialized for environment: ${environment}`);
  }

  captureException(
    exception: unknown,
    context?: Record<string, unknown>,
  ): string {
    return Sentry.captureException(exception, {
      extra: context,
    });
  }

  captureMessage(
    message: string,
    level?: Sentry.SeverityLevel,
    context?: Record<string, unknown>,
  ): string {
    return Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }

  setExtra(key: string, value: unknown): void {
    const scope = Sentry.getCurrentScope();
    scope.setExtra(key, value);
  }

  setTag(key: string, value: string): void {
    const scope = Sentry.getCurrentScope();
    scope.setTag(key, value);
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    const scope = Sentry.getCurrentScope();
    scope.setUser(user);
  }
}
