import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLogger } from '../utils/logger.service';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const ctx = gqlContext.getContext();

    // Get the operation name and type
    const operationType = info.operation.operation;
    const operationName = info.fieldName;
    const variables = gqlContext.getArgs();
    const userAgent = ctx.req?.headers?.['user-agent'] || 'unknown';
    const ip = this.getClientIp(ctx.req);

    // Log the incoming request
    this.logger.log({
      message: `GraphQL ${operationType} ${operationName} started`,
      operationType,
      operationName,
      variables,
      userAgent,
      ip,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          this.logger.log({
            message: `GraphQL ${operationType} ${operationName} completed in ${duration}ms`,
            operationType,
            operationName,
            duration,
            userAgent,
            ip,
          });
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.warn({
            message: `GraphQL ${operationType} ${operationName} failed in ${duration}ms`,
            operationType,
            operationName,
            duration,
            userAgent,
            ip,
            error: error.message,
          });
        },
      }),
    );
  }

  private getClientIp(request: Request | undefined): string | undefined {
    if (!request) return undefined;

    // Get IP from various headers that might be set by proxies
    const xForwardedFor = (request.headers?.['x-forwarded-for'] as string)
      ?.split(',')[0]
      ?.trim();
    if (xForwardedFor) return xForwardedFor;

    // Check other common headers
    const xRealIp = request.headers?.['x-real-ip'] as string;
    if (xRealIp) return xRealIp;

    // Fallback to socket address
    const remoteAddress =
      (request as any).connection?.remoteAddress ||
      (request as any).socket?.remoteAddress ||
      'unknown';

    return remoteAddress;
  }
}
