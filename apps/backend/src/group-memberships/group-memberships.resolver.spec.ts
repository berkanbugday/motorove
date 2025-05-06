import { Test, TestingModule } from '@nestjs/testing';
import { GroupMembershipsResolver } from './group-memberships.resolver';

describe('GroupMembershipsResolver', () => {
  let resolver: GroupMembershipsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupMembershipsResolver],
    }).compile();

    resolver = module.get<GroupMembershipsResolver>(GroupMembershipsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
