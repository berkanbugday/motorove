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

  async updatePassword(email: string, token: string, password: string) {
    const { error: verifyError } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });

    if (verifyError) {
      throw new Error(verifyError.message);
    }

    const { error } = await this.supabase.auth.updateUser({
      password,
    });

    return { error };
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
