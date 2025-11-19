import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { UserLocationsService } from './user-locations.service';
import { UpdateUserLocationInput } from './dto/update-user-location.input';
import { UserLocationDto } from './dto/user-location.dto';

@Resolver(() => UserLocationDto)
export class UserLocationsResolver {
  constructor(private userLocationsService: UserLocationsService) {}

  @UseGuards(JwtGuard)
  @Mutation(() => UserLocationDto)
  async updateUserLocation(
    @CurrentUser() user: User,
    @Args('input') input: UpdateUserLocationInput,
  ): Promise<UserLocationDto> {
    return await this.userLocationsService.updateLocation(user.id, input);
  }
}
