import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '../core/config/config.service';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'supabase_credentials',
      });
    }

    // Regular client for non-admin operations (uses anon key)
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
      },
    });

    // Admin client for admin operations (uses service role key)
    if (supabaseServiceRoleKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: false,
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      this.logger.warn(
        'SUPABASE_SERVICE_ROLE_KEY not configured. Admin operations (e.g., deleteUser) will fail.',
      );
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'supabase_admin_credentials',
      });
    }
    return this.supabaseAdmin;
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
    if (!this.supabaseAdmin) {
      const error = new Error(
        'SUPABASE_SERVICE_ROLE_KEY not configured. Cannot delete user.',
      );
      this.logger.error(`Failed to delete Supabase user ${userId}:`, error);
      return { error };
    }

    const { error } = await this.supabaseAdmin.auth.admin.deleteUser(userId);
    return { error };
  }
}
