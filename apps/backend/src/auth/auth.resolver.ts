import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { AccessToken } from './decorators/access-token.decorator';

import { AuthResponse } from './models/auth-response.model';
import { SignUpInput } from './dto/signup.input';
import { SignInInput } from './dto/signin.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { UpdateEmailInput } from './dto/update-email.input';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async signUp(@Args('input') input: SignUpInput): Promise<AuthResponse> {
    const { firstName, lastName, email, password, preferredLanguage } = input;
    return await this.authService.signUp(
      firstName,
      lastName,
      email,
      password,
      preferredLanguage,
    );
  }

  @Mutation(() => AuthResponse)
  async signIn(@Args('input') input: SignInInput): Promise<AuthResponse> {
    const { email, password } = input;
    return await this.authService.signIn(email, password);
  }

  @Mutation(() => Boolean)
  async signOut(): Promise<boolean> {
    await this.authService.signOut();
    return true;
  }

  @Mutation(() => AuthResponse)
  async refreshToken(@Args('token') token: string): Promise<AuthResponse> {
    return await this.authService.refreshToken(token);
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<boolean> {
    return await this.authService.resetPassword(input.email);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async updateEmail(
    @AccessToken() accessToken: string,
    @Args('input') input: UpdateEmailInput,
  ): Promise<boolean> {
    return await this.authService.updateEmail(
      accessToken,
      input.email,
      input.newEmail,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async updatePassword(
    @AccessToken() accessToken: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return await this.authService.updatePassword(accessToken, newPassword);
  }

  @Mutation(() => Boolean)
  async resend(@Args('email') email: string): Promise<boolean> {
    return await this.authService.resend(email);
  }
}
