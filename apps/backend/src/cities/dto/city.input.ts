import { InputType } from '@nestjs/graphql';
import { CityDto } from './city.dto';

@InputType()
export class CityInput extends CityDto {}
