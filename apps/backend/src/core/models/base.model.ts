import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { IBaseWithRelations } from '@motorove/shared';

@ObjectType({ isAbstract: true })
export abstract class BaseModel implements IBaseWithRelations {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  createdBy: Partial<User>;

  @Field()
  createdById: string;

  @Field()
  createdAt: Date;

  @Field(() => User)
  updatedBy: Partial<User>;

  @Field()
  updatedById: string;

  @Field()
  updatedAt: Date;

  @Field()
  isActive: boolean;
}
