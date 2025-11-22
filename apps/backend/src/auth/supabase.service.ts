import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '../core/config/config.service';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'supabase_credentials',
      });
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
    });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async refreshToken(refreshToken: string) {
    return await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getUser(jwt: string) {
    return await this.supabase.auth.getUser(jwt);
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email);
  }

  async updateEmail(accessToken: string, newEmail: string) {
    // Set the session with the access token before updating
    await this.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '', // Not needed for update operations
    });

    return await this.supabase.auth.updateUser({
      email: newEmail,
    });
  }

  async updatePassword(token: string, newPassword: string) {
    // This method handles two scenarios:
    // 1. JWT token from mobile app (authenticated user changing password)
    // 2. Token hash from password reset email (unauthenticated password reset)

    // Check if it's a JWT token (contains dots) or a hash token
    const isJWT = token.includes('.');

    if (isJWT) {
      // Set the session with the access token before updating
      await this.supabase.auth.setSession({
        access_token: token,
        refresh_token: '', // Not needed for update operations
      });

      return await this.supabase.auth.updateUser({
        password: newPassword,
      });
    } else {
      // Password reset flow: Verify token hash and exchange for session
      const { data: verifyData, error: verifyError } =
        await this.supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });

      if (verifyError || !verifyData.session) {
        ExceptionHelper.unauthorized('errors.auth.invalid_or_expired_token');
      }

      // Now we have a valid session, use it to update the password
      const { error: updateError } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        ExceptionHelper.unauthorized('errors.auth.invalid_or_expired_token');
      }

      return { data: verifyData, error: null };
    }
  }

  async deleteUser(userId: string) {
    const { error } = await this.supabase.auth.admin.deleteUser(userId);
    return { error };
  }

  async resend(email: string) {
    return await this.supabase.auth.resend({
      email,
      type: 'signup',
    });
  }
}
