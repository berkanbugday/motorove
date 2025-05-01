import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role } from '../../../generated/prisma';

registerEnumType(Role, {
  name: 'Role',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => Role)
  role: Role;

  @Field()
  supabaseId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
