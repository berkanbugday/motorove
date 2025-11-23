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

  async getUser(jwt: string) {
    return await this.supabase.auth.getUser(jwt);
  }

  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
    });
  }

  async updatePassword(token: string, newPassword: string) {
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

  async deleteUser(userId: string) {
    const { error } = await this.supabase.auth.admin.deleteUser(userId);
    return { error };
  }
}
