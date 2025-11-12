import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UpdatePasswordInput } from './dto/update-password.input';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('update-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordInput) {
    try {
      const { token, password } = updatePasswordDto;

      if (!token || !password) {
        ExceptionHelper.badRequest('errors.auth.token_and_password_required');
      }

      // Use the token (access token from password reset email) to update password
      const result = await this.authService.updatePassword(token, password);

      if (result) {
        return {
          success: true,
          message: 'errors.auth.password_updated_successfully',
        };
      } else {
        ExceptionHelper.unauthorized('errors.auth.failed_to_update_password');
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      ExceptionHelper.unauthorized('errors.auth.invalid_or_expired_token');
    }
  }
}
