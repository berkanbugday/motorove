import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

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
      throw new UnauthorizedException('Authorization header not found');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const token = parts[1];

    try {
      const user = await this.authService.validateUser(token);
      req.user = user;
      req.accessToken = token; // Store access token for Supabase operations
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
