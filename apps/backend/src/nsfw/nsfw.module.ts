import { Module } from '@nestjs/common';
import { NSFWService } from './nsfw.service';

@Module({
  providers: [NSFWService],
  exports: [NSFWService],
})
export class NSFWModule {}
