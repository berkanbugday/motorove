import { registerEnumType } from '@nestjs/graphql';

export enum GroupTag {
  // Motorcycle Types
  TOURING = 'Touring',
  CAFE_RACER = 'Cafe Racer',
  CRUISER = 'Cruiser',
  SPORT = 'Sport',
  ADVENTURE = 'Adventure',
  SCOOTER = 'Scooter',
  NAKED = 'Naked',
  CUSTOM = 'Custom',
  VINTAGE = 'Vintage',
  DUAL_SPORT = 'Dual Sport',
  DIRT_BIKE = 'Dirt Bike',
  CHOPPER = 'Chopper',
  BOBBER = 'Bobber',
  ENDURO = 'Enduro',
  MOTO_CROSS = 'Moto Cross',
  SUPER_MOTO = 'Super Moto',
  TRIKE = 'Trike',
  SIDECAR = 'Sidecar',
  ELECTRIC = 'Electric',
  CLASSIC = 'Classic',

  // Rider Experience Levels
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  PROFESSIONAL = 'Professional',

  // Riding Patterns
  WEEKEND_RIDER = 'Weekend Rider',
  DAILY_COMMUTER = 'Daily Commuter',
  NIGHT_RIDER = 'Night Rider',
  LONG_DISTANCE = 'Long Distance',
  URBAN_RIDER = 'Urban Rider',
  MOUNTAIN_RIDER = 'Mountain Rider',
  COASTAL_RIDER = 'Coastal Rider',
  TRACK_DAY = 'Track Day',
  OFF_ROAD = 'Off-Road',

  // Special Interests
  MECHANICS = 'Mechanics',
  CUSTOMIZATION = 'Customization',
  RESTORATION = 'Restoration',
  PHOTOGRAPHY = 'Photography',
  ECO_FRIENDLY = 'Eco-Friendly',
  TECHNOLOGY = 'Technology',
  VINTAGE_ENTHUSIAST = 'Vintage Enthusiast',

  // Events
  RALLY = 'Rally',
  MEETUP = 'Meetup',
  CHARITY_RIDE = 'Charity Ride',
  TRACK_EVENT = 'Track Event',
  COMPETITION = 'Competition',
  TRAINING = 'Training',
}

registerEnumType(GroupTag, {
  name: 'GroupTag',
  description: 'Tags that can be associated with groups',
});
