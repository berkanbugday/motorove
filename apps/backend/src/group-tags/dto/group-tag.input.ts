import { InputType } from '@nestjs/graphql';
import { GroupTagDto } from './group-tag.dto';

@InputType()
export class GroupTagInput extends GroupTagDto {}
