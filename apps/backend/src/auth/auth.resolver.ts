import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignUpInput } from './dto/signup.input';

@Resolver(() => Boolean)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => Boolean)
  async signUp(@Args('input') input: SignUpInput): Promise<boolean> {
    const {
      firstName,
      lastName,
      email,
      password,
      preferredLanguage,
      eulaAccepted,
    } = input;
    return await this.authService.signUp(
      firstName,
      lastName,
      email,
      password,
      preferredLanguage,
      eulaAccepted,
    );
  }
}
