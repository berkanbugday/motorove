import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';

import { AuthResponse } from './models/auth-response.model';
import { SignUpInput } from './dto/signup.input';
import { SignInInput } from './dto/signin.input';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async signUp(@Args('input') input: SignUpInput): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = input;
    return await this.authService.signUp(email, password, firstName, lastName);
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
}
