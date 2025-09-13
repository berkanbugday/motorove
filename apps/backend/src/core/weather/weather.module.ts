import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherResolver } from './weather.resolver';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from '../../auth/auth.module';
import { BullModule } from '@nestjs/bull';
import { WEATHER_CACHE_QUEUE } from './constants';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    ConfigModule,
    BullModule.registerQueue({
      name: WEATHER_CACHE_QUEUE,
    }),
  ],
  providers: [WeatherResolver, WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
