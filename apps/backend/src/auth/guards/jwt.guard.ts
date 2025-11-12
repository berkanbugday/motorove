import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { ExceptionHelper } from '../../core/exceptions/exception-helper.service';

interface GqlContext {
  req: Request & { user?: any; accessToken?: string };
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<GqlContext>();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      ExceptionHelper.unauthorized('errors.common.not_found', {
        resource: 'authorization_header',
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      ExceptionHelper.unauthorized('errors.auth.invalid_authorization_header');
    }

    const token = parts[1];

    try {
      const user = await this.authService.validateUser(token);
      req.user = user;
      req.accessToken = token; // Store access token for Supabase operations
      return true;
    } catch {
      ExceptionHelper.unauthorized('errors.auth.invalid_token');
    }
  }
}
