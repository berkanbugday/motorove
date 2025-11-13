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
        autoRefreshToken: false,
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

  async updatePassword(accessToken: string, newPassword: string) {
    // For password reset, we need to verify the token first
    // The access token from password reset email should be valid
    const { data: userData, error: userError } =
      await this.supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      return { error: userError || new Error('Invalid or expired token') };
    }

    // Set the session with the access token before updating
    const { error: sessionError } = await this.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '', // Empty for password reset flow
    });

    if (sessionError) {
      return { error: sessionError };
    }

    return await this.supabase.auth.updateUser({
      password: newPassword,
    });
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
