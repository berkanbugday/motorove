import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class Session {
  @Field()
  access_token: string;

  @Field()
  refresh_token: string;

  @Field()
  expires_in: number;
}

@ObjectType()
export class AuthResponse {
  @Field(() => User)
  user: User;

  @Field(() => Session, { nullable: true })
  session: Session | null;
}
