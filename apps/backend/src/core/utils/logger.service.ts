import { Injectable, LoggerService } from '@nestjs/common';
import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston';
import { SentryService } from '../sentry/sentry.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class CustomLogger implements LoggerService {
  private context?: string;
  private winstonLogger: WinstonLogger;

  constructor(
    private readonly sentryService: SentryService,
    private readonly configService: ConfigService,
  ) {
    this.winstonLogger = createLogger({
      level: this.configService.get<string>('LOG_LEVEL') || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
        format.printf((info) => {
          const { timestamp, level, message, context, ...rest } = info;
          return JSON.stringify({
            timestamp,
            level,
            context: context || this.context,
            message,
            ...rest,
          });
        }),
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf((info) => {
              const { timestamp, level, message, context, ...rest } = info;
              const contextValue = context || this.context;
              const contextStr = contextValue
                ? `[${
                    typeof contextValue === 'object'
                      ? JSON.stringify(contextValue)
                      : String(contextValue)
                  }]`
                : '';
              const metaStr = Object.keys(rest).length
                ? JSON.stringify(rest)
                : '';
              return `${String(timestamp)} ${String(level)} ${contextStr} ${String(message)} ${metaStr}`;
            }),
          ),
        }),
      ],
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: unknown, context?: string): void {
    this.winstonLogger.info(this.formatMessage(message), { context });
  }

  error(message: unknown, trace?: string, context?: string): void {
    // Also send to Sentry for error level logs
    const errorMessage = this.formatMessage(message);
    this.sentryService.captureMessage(errorMessage, 'error', {
      trace,
      context: context || this.context,
    });

    this.winstonLogger.error(errorMessage, { trace, context });
  }

  warn(message: unknown, context?: string): void {
    // Also send to Sentry for warning level logs
    const warnMessage = this.formatMessage(message);
    this.sentryService.captureMessage(warnMessage, 'warning', {
      context: context || this.context,
    });

    this.winstonLogger.warn(warnMessage, { context });
  }

  debug(message: unknown, context?: string): void {
    this.winstonLogger.debug(this.formatMessage(message), { context });
  }

  verbose(message: unknown, context?: string): void {
    this.winstonLogger.verbose(this.formatMessage(message), { context });
  }

  private formatMessage(message: unknown): string {
    if (typeof message === 'object' && message !== null) {
      return JSON.stringify(message);
    }
    return String(message);
  }
}
