import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../users/models/user.model';
import { AuthResponse } from './models/auth-response.model';
import { SignUpInput } from './dto/signup.input';
import { SignInInput } from './dto/signin.input';

@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async signUp(
    @Args('signUpInput') signUpInput: SignUpInput,
  ): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = signUpInput;
    return this.authService.signUp(email, password, firstName, lastName);
  }

  @Mutation(() => AuthResponse)
  async signIn(
    @Args('signInInput') signInInput: SignInInput,
  ): Promise<AuthResponse> {
    const { email, password } = signInInput;
    return this.authService.signIn(email, password);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(@Args('token') token: string): Promise<AuthResponse> {
    return this.authService.refreshToken(token);
  }
}
