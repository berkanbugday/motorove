import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';

import { AuthResponse } from './models/auth-response.model';
import { SignUpInput } from './dto/signup.input';
import { SignInInput } from './dto/signin.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { UpdatePasswordInput } from './dto/update-password.input';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async signUp(@Args('input') input: SignUpInput): Promise<AuthResponse> {
    const { firstName, lastName, email, password } = input;
    return await this.authService.signUp(firstName, lastName, email, password);
  }

  @Mutation(() => AuthResponse)
  async signIn(@Args('input') input: SignInInput): Promise<AuthResponse> {
    const { email, password } = input;
    return await this.authService.signIn(email, password);
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

  @Mutation(() => Boolean)
  async updatePassword(
    @Args('input') input: UpdatePasswordInput,
  ): Promise<boolean> {
    return await this.authService.updatePassword(input.password);
  }
}
