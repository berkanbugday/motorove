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
import { GraphQLResolveInfo } from 'graphql';

interface GqlInfo {
  operation: {
    operation: string;
  };
  fieldName: string;
}

interface GqlContextType {
  req?: Request;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const contextType = context.getType<string>();

    // Check if this is a GraphQL request
    if (contextType === 'graphql') {
      return this.handleGraphQLRequest(context, next, now);
    }

    // Handle HTTP/REST requests
    return this.handleHttpRequest(context, next, now);
  }

  private handleGraphQLRequest(
    context: ExecutionContext,
    next: CallHandler,
    now: number,
  ): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo<GraphQLResolveInfo>() as GqlInfo;
    const ctx = gqlContext.getContext<GqlContextType>();

    // Get the operation name and type
    const operationType = info.operation.operation;
    const operationName = info.fieldName;
    const variables = gqlContext.getArgs<Record<string, unknown>>();
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
        error: (error: Error) => {
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

  private handleHttpRequest(
    context: ExecutionContext,
    next: CallHandler,
    now: number,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers?.['user-agent'] || 'unknown';
    const ip = this.getClientIp(request);

    // Log the incoming request
    this.logger.log({
      message: `HTTP ${method} ${url} started`,
      method,
      url,
      userAgent,
      ip,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - now;
          this.logger.log({
            message: `HTTP ${method} ${url} completed in ${duration}ms`,
            method,
            url,
            duration,
            userAgent,
            ip,
          });
        },
        error: (error: Error) => {
          const duration = Date.now() - now;
          this.logger.warn({
            message: `HTTP ${method} ${url} failed in ${duration}ms`,
            method,
            url,
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
    const forwardedHeader = request.headers?.['x-forwarded-for'];
    const xForwardedFor =
      typeof forwardedHeader === 'string'
        ? forwardedHeader.split(',')[0]?.trim()
        : undefined;

    if (xForwardedFor) return xForwardedFor;

    // Check other common headers
    const xRealIp = request.headers?.['x-real-ip'] as string | undefined;
    if (xRealIp) return xRealIp;

    // Fallback to socket address
    const connection = request.socket?.remoteAddress || 'unknown';
    return connection;
  }
}
