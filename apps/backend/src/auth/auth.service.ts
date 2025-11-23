import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthUser } from './models/auth-user.model';
import { NotificationType } from '../enums/models/notification-type.enum';
import { Language } from '../enums/models/language.enum';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';

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
    preferredLanguage?: Language,
  ): Promise<boolean> {
    let supabaseUser: any = null;

    try {
      // First, check if the email already exists in our database
      const existingUser = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        ExceptionHelper.conflict('errors.common.already_exists', {
          resource: 'email',
        });
      }

      // Register user with Supabase
      const { data, error } = await this.supabaseService.signUp(
        email,
        password,
      );

      if (error) {
        if (error.message.includes('already registered')) {
          ExceptionHelper.conflict('errors.common.already_exists', {
            resource: 'email',
          });
        }
        throw new UnauthorizedException(error.message);
      }

      if (!data.user) {
        ExceptionHelper.unauthorized('errors.auth.user_not_created');
      }

      supabaseUser = data.user;

      // Use a transaction for database operations
      const result = await this.prismaService.$transaction(async (tx) => {
        // Create user in our database
        const user = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            supabaseId: supabaseUser.id,
          },
          include: {
            userSetting: true,
          },
        });

        const notificationPreferences = {} as Record<NotificationType, boolean>;
        Object.values(NotificationType).map((notificationType) => {
          notificationPreferences[notificationType] = true;
        });

        // Create default notification settings for the new user
        await tx.userSetting.create({
          data: {
            userId: user.id,
            notificationPreferences: notificationPreferences,
            preferredLanguage: preferredLanguage,
          },
        });

        return user;
      });

      return result.id ? true : false;
    } catch (error) {
      // If we created a Supabase user but database operations failed,
      // we should attempt to delete the Supabase user to maintain consistency
      if (supabaseUser) {
        try {
          await this.supabaseService.deleteUser(supabaseUser.id);
        } catch (deleteError) {
          // Log the error but don't throw it, as the main error is more important
          console.error(
            'Failed to rollback Supabase user creation:',
            deleteError,
          );
        }
      }

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        ExceptionHelper.conflict('errors.common.already_exists', {
          resource: 'email',
        });
      }
      throw error;
    }
  }

  async validateUser(token: string): Promise<AuthUser> {
    const { data, error } = await this.supabaseService.getUser(token);

    if (error || !data.user) {
      ExceptionHelper.unauthorized('errors.auth.invalid_token');
    }

    const user = await this.prismaService.user.findFirst({
      where: { supabaseId: data.user.id },
      select: {
        id: true,
        email: true,
        userSetting: {
          select: {
            preferredLanguage: true,
          },
        },
      },
    });

    if (!user) {
      ExceptionHelper.unauthorized('errors.common.not_found', {
        resource: 'user',
      });
    }

    return {
      id: user.id,
      email: user.email,
      preferredLanguage: user.userSetting?.preferredLanguage as Language,
    };
  }

  async updatePassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Token can be either:
      // - JWT access token from mobile app (authenticated user)
      // - Token hash from password reset email (unauthenticated reset)
      const { error } = await this.supabaseService.updatePassword(
        token,
        newPassword,
      );

      if (error) {
        ExceptionHelper.unauthorized('errors.auth.invalid_or_expired_token');
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      ExceptionHelper.unauthorized('errors.auth.failed_to_update_password');
    }
  }
}
