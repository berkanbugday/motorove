import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '../core/config/config.service';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase credentials not found in environment variables',
      );
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
    // Set the session with the access token before updating
    await this.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '', // Not needed for update operations
    });

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
