import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../auth/models/user.model';

@ObjectType({ isAbstract: true })
export abstract class BaseModel {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  createdBy: User;

  @Field()
  createdById: string;

  @Field()
  createdAt: Date;

  @Field(() => User)
  updatedBy: User;

  @Field()
  updatedById: string;

  @Field()
  updatedAt: Date;

  @Field()
  isActive: boolean;
}
