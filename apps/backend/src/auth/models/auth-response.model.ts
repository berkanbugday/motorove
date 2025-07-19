import { ObjectType, Field } from '@nestjs/graphql';
import { AuthUser } from './auth-user.model';

@ObjectType()
export class Session {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field()
  expires_in: number;

  @Field({ nullable: true })
  expires_at?: number;
}

@ObjectType()
export class AuthResponse {
  @Field(() => AuthUser)
  user: AuthUser;

  @Field(() => Session, { nullable: true })
  session?: Session | null;
}
