import { Test, TestingModule } from '@nestjs/testing';
import { GroupMembershipsService } from './group-memberships.service';

describe('GroupMembershipsService', () => {
  let service: GroupMembershipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupMembershipsService],
    }).compile();

    service = module.get<GroupMembershipsService>(GroupMembershipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
