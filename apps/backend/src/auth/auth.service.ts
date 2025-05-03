import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from './models/user.model';
import { AuthResponse } from './models/auth-response.model';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async signUp(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<AuthResponse> {
    try {
      // Register user with Supabase
      const { data, error } = await this.supabaseService.signUp(
        email,
        password,
      );

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      if (!data.user) {
        throw new UnauthorizedException('User not created');
      }

      // Create user in our database
      const user = await this.prismaService.user.create({
        data: {
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          supabaseId: data.user.id,
        },
      });

      return {
        user: {
          ...user,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          avatar: user.avatar || undefined,
        },
        session: data.session || undefined,
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await this.supabaseService.signIn(email, password);

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user from our database
    const user = await this.prismaService.user.findUnique({
      where: { supabaseId: data.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        ...user,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        avatar: user.avatar || undefined,
      },
      session: data.session || undefined,
    };
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      // Use Supabase's refresh token functionality
      const { data, error } = await this.supabaseService.refreshToken(token);

      if (error) {
        throw new UnauthorizedException(
          error.message || 'Failed to refresh token',
        );
      }

      if (!data.user) {
        throw new UnauthorizedException('User not found during token refresh');
      }

      // Get user from our database
      const user = await this.prismaService.user.findUnique({
        where: { supabaseId: data.user.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        user: {
          ...user,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          avatar: user.avatar || undefined,
        },
        session: data.session || undefined,
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Token refresh failed';
      console.error('Token refresh error:', errorMessage);
      throw new UnauthorizedException(errorMessage);
    }
  }

  async validateUser(token: string): Promise<User> {
    const { data, error } = await this.supabaseService.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prismaService.user.findUnique({
      where: { supabaseId: data.user.id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatar: user.avatar || undefined,
    };
  }
}
