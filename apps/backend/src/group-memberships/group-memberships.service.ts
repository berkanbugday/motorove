import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { GroupPrivacy } from '../enums/models/group-privacy.enum';
import { GroupMembershipStatus } from '../enums/models/group-membership-status.enum';

@Injectable()
export class GroupMembershipsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.groupMembership.findMany({
      where: {
        isActive: true,
      },
      include: {
        group: true,
        user: true,
      },
    });
  }

  async findByGroup(groupId: string) {
    return await this.prisma.groupMembership.findMany({
      where: {
        groupId,
        isActive: true,
      },
      include: {
        user: true,
      },
    });
  }

  async findByUser(userId: string) {
    return await this.prisma.groupMembership.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        group: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.groupMembership.findUnique({
      where: { id },
      include: {
        group: true,
        user: true,
      },
    });
  }

  async addMember(groupId: string, userId: string, adminId: string) {
    // Check if the group exists
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        memberships: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }
    // if (group.privacy === GroupPrivacy.PRIVATE) {
    //   // Check if the admin user has admin rights
    //   const adminMembership = group.memberships.find(
    //     (m) => m.userId === adminId && m.role === GroupMemberRole.ADMIN,
    //   );

    //   if (!adminMembership) {
    //     throw new ForbiddenException(
    //       'You are not authorized to add members to this group',
    //     );
    //   }
    // }

    // Check if the user is already a member
    const existingMembership = group.memberships.find(
      (m) => m.userId === userId,
    );

    if (existingMembership) {
      throw new ForbiddenException('User is already a member of this group');
    }

    // Add the user as a member
    return this.prisma.groupMembership.create({
      data: {
        group: {
          connect: { id: groupId },
        },
        user: {
          connect: { id: userId },
        },
        role: GroupMemberRole.MEMBER,
        status:
          group.privacy === GroupPrivacy.PRIVATE
            ? GroupMembershipStatus.PENDING
            : GroupMembershipStatus.APPROVED,
        createdBy: {
          connect: { id: adminId },
        },
        updatedBy: {
          connect: { id: adminId },
        },
      },
      include: {
        group: true,
        user: true,
      },
    });
  }

  async changeMemberRole(
    groupId: string,
    userId: string,
    newRole: GroupMemberRole,
    adminId: string,
  ) {
    // Check if the group exists
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        memberships: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if the admin user has admin rights
    const adminMembership = group.memberships.find(
      (m) => m.userId === adminId && m.role === GroupMemberRole.ADMIN,
    );

    if (!adminMembership) {
      throw new ForbiddenException(
        'You are not authorized to change member roles in this group',
      );
    }

    // Check if the member exists
    const membershipToUpdate = group.memberships.find(
      (m) => m.userId === userId,
    );

    if (!membershipToUpdate) {
      throw new NotFoundException(
        `Member with ID ${userId} not found in this group`,
      );
    }

    // Update the member's role
    return this.prisma.groupMembership.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        role: newRole,
        updatedBy: {
          connect: { id: adminId },
        },
      },
      include: {
        group: true,
        user: true,
      },
    });
  }

  async removeMember(groupId: string, userId: string, adminId: string) {
    // Check if the group exists
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        memberships: true,
        createdBy: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // If the user is removing themselves, allow it
    if (userId === adminId) {
      // Check if the user is the creator - creators can't leave their own groups
      if (group.createdBy.id === userId) {
        throw new ForbiddenException(
          'Group creators cannot leave their own groups. Transfer ownership first or delete the group.',
        );
      }

      return this.prisma.groupMembership.delete({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });
    }

    // If removing another member, check if the admin user has admin rights
    const adminMembership = group.memberships.find(
      (m) => m.userId === adminId && m.role === GroupMemberRole.ADMIN,
    );

    if (!adminMembership) {
      throw new ForbiddenException(
        'You are not authorized to remove members from this group',
      );
    }

    // Check if the member exists
    const membershipToDelete = group.memberships.find(
      (m) => m.userId === userId,
    );

    if (!membershipToDelete) {
      throw new NotFoundException(
        `Member with ID ${userId} not found in this group`,
      );
    }

    // Delete the membership
    return this.prisma.groupMembership.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  }

  async updateMembershipStatus(
    groupId: string,
    userId: string,
    newStatus: GroupMembershipStatus,
    adminId: string,
  ) {
    // Check if the group exists
    const group = await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        memberships: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if the admin user has admin rights
    const adminMembership = group.memberships.find(
      (m) => m.userId === adminId && m.role === GroupMemberRole.ADMIN,
    );

    if (!adminMembership) {
      throw new ForbiddenException(
        'You are not authorized to update membership status in this group',
      );
    }

    // Check if the membership exists
    const membershipToUpdate = group.memberships.find(
      (m) => m.userId === userId,
    );

    if (!membershipToUpdate) {
      throw new NotFoundException(
        `Member with ID ${userId} not found in this group`,
      );
    }

    // Update the membership status
    return this.prisma.groupMembership.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        status: newStatus,
        updatedBy: {
          connect: { id: adminId },
        },
      },
      include: {
        group: true,
        user: true,
      },
    });
  }
}
