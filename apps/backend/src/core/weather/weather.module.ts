import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherResolver } from './weather.resolver';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from '../../auth/auth.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [HttpModule, AuthModule, ConfigModule, CacheModule],
  providers: [WeatherResolver, WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
