import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthResponse } from './models/auth-response.model';
import { AuthUser } from './models/auth-user.model';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private prismaService: PrismaService,
  ) {}

  async signUp(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    try {
      // First, check if the email already exists in our database
      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      // Register user with Supabase
      const { data, error } = await this.supabaseService.signUp(
        email,
        password,
      );

      if (error) {
        if (error.message.includes('already registered')) {
          throw new ConflictException('Email already exists');
        }
        throw new UnauthorizedException(error.message);
      }

      if (!data.user) {
        throw new UnauthorizedException('User not created');
      }

      // Create user in our database
      const user = await this.prismaService.user.create({
        data: {
          firstName,
          lastName,
          email,
          supabaseId: data.user.id,
          avatar: 'users/avatars/default.png',
        },
      });

      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          hasCompletedSetup: user.hasCompletedSetup,
        },
        session: data.session,
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
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        hasCompletedSetup: user.hasCompletedSetup,
      },
      session: data.session,
    };
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      // Use Supabase's refresh token functionality
      const { data, error } = await this.supabaseService.refreshToken(token);

      if (error) {
        // Check for specific error types from Supabase
        if (error.message.includes('Token has expired or is invalid')) {
          console.error('Token expiration error:', error.message);
          throw new UnauthorizedException('Token has expired');
        }

        if (error.message.includes('Token already used')) {
          console.error('Refresh token reuse detected:', error.message);
          throw new UnauthorizedException(
            'Invalid Refresh Token: Already Used',
          );
        }

        if (error.message.includes('JWT')) {
          console.error('JWT validation error:', error.message);
          throw new UnauthorizedException('Invalid JWT token');
        }

        console.error('Token refresh error:', error.message);
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
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          hasCompletedSetup: user.hasCompletedSetup,
        },
        session: data.session,
      };
    } catch (error: unknown) {
      let errorMessage = 'Token refresh failed';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for JWT validation errors in the error message
        if (
          errorMessage.includes('InvalidJWTToken') ||
          errorMessage.includes('JWT claim') ||
          errorMessage.includes('JWT token')
        ) {
          console.error('JWT validation error:', errorMessage);
          throw new UnauthorizedException('Invalid JWT token');
        }
      }

      console.error('Token refresh error:', errorMessage);

      // Rethrow the error with appropriate message
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(errorMessage);
    }
  }

  async validateUser(token: string): Promise<AuthUser> {
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
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      hasCompletedSetup: user.hasCompletedSetup,
    };
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      // First verify if the user exists in our database
      // const user = await this.prismaService.user.findUnique({
      //   where: { email },
      // });

      // if (!user) {
      //   throw new UnauthorizedException('User not found');
      // }

      const { error } = await this.supabaseService.resetPassword(email);

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to send password reset email');
    }
  }

  async updatePassword(
    email: string,
    token: string,
    password: string,
  ): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.updatePassword(
        email,
        token,
        password,
      );

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      return true;
    } catch {
      throw new UnauthorizedException('Failed to update password');
    }
  }
}
