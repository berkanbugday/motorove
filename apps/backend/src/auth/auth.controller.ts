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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('update-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordInput) {
    try {
      const { email, token, password } = updatePasswordDto;

      if (!email || !token || !password) {
        throw new BadRequestException('Email, token and password are required');
      }

      const result = await this.authService.updatePassword(
        email,
        token,
        password,
      );

      if (result) {
        return { success: true, message: 'Password updated successfully' };
      } else {
        throw new UnauthorizedException('Failed to update password');
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
