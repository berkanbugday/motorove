import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { AddressFilterInput } from './dto/address-filter.input';
import { AddressType } from '../enums/models/address-type.enum';
import { Language } from '../enums/models/language.enum';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async createAddress(userId: string, createAddressInput: CreateAddressInput) {
    // Check if we are creating an address for a post or an event
    if (!createAddressInput.postId && !createAddressInput.eventId) {
      throw new BadRequestException(
        'Either postId or eventId must be provided',
      );
    }

    if (createAddressInput.postId && createAddressInput.eventId) {
      throw new BadRequestException(
        'Cannot associate address with both post and event',
      );
    }

    // If creating for a post, check if user owns the post
    if (createAddressInput.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: createAddressInput.postId },
      });

      if (!post) {
        throw new NotFoundException(
          `Post with ID ${createAddressInput.postId} not found`,
        );
      }

      if (post.createdById !== userId) {
        throw new BadRequestException(
          'You do not have permission to add an address to this post',
        );
      }
    }

    // If creating for an event, check if user owns the event
    if (createAddressInput.eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: createAddressInput.eventId },
      });

      if (!event) {
        throw new NotFoundException(
          `Event with ID ${createAddressInput.eventId} not found`,
        );
      }

      if (event.createdById !== userId) {
        throw new BadRequestException(
          'You do not have permission to add an address to this event',
        );
      }
    }

    // Create the address with type-safe handling of latitude and longitude
    return this.prisma.address.create({
      data: {
        address: createAddressInput.address,
        language: createAddressInput.language,
        type: createAddressInput.type,
        latitude: createAddressInput.latitude,
        longitude: createAddressInput.longitude,
        post: createAddressInput.postId
          ? { connect: { id: createAddressInput.postId } }
          : undefined,
        event: createAddressInput.eventId
          ? { connect: { id: createAddressInput.eventId } }
          : undefined,
      },
    });
  }

  async updateAddress(userId: string, updateAddressInput: UpdateAddressInput) {
    // First, find the address to check ownership
    const address = await this.prisma.address.findUnique({
      where: { id: updateAddressInput.id },
      include: {
        post: true,
        event: true,
      },
    });

    if (!address) {
      throw new NotFoundException(
        `Address with ID ${updateAddressInput.id} not found`,
      );
    }

    // Check permissions - user should own the post or event this address is attached to
    if (address.post && address.post.createdById !== userId) {
      throw new BadRequestException(
        'You do not have permission to update this address',
      );
    }

    if (address.event && address.event.createdById !== userId) {
      throw new BadRequestException(
        'You do not have permission to update this address',
      );
    }

    // Cannot change postId or eventId after creation
    if (updateAddressInput.postId || updateAddressInput.eventId) {
      throw new BadRequestException(
        'Cannot change the associated post or event after address creation',
      );
    }

    // Create update data object with type safety
    const updateData: {
      address?: string;
      language?: Language;
      type?: AddressType;
      latitude?: number;
      longitude?: number;
    } = {};

    // Add only defined fields to update data
    if (updateAddressInput.address !== undefined) {
      updateData.address = updateAddressInput.address;
    }

    if (updateAddressInput.language !== undefined) {
      updateData.language = updateAddressInput.language;
    }

    if (updateAddressInput.type !== undefined) {
      updateData.type = updateAddressInput.type;
    }

    if (updateAddressInput.latitude !== undefined) {
      updateData.latitude = updateAddressInput.latitude;
    }

    if (updateAddressInput.longitude !== undefined) {
      updateData.longitude = updateAddressInput.longitude;
    }

    // Update the address with the constructed data object
    return this.prisma.address.update({
      where: { id: updateAddressInput.id },
      data: updateData,
    });
  }

  async findAll(limit?: number, skip?: number, filters?: AddressFilterInput) {
    return await this.prisma.address.findMany({
      take: limit || undefined,
      skip: skip || undefined,
      where: {
        postId: filters?.postId || undefined,
        eventId: filters?.eventId || undefined,
        type: filters?.type || undefined,
        language: filters?.language || undefined,
      },
      include: {
        post: true,
        event: true,
      },
    });
  }

  async findOne(id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
      include: {
        post: true,
        event: true,
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async removeAddress(userId: string, id: string) {
    // Find address to check permissions
    const address = await this.prisma.address.findUnique({
      where: { id },
      include: {
        post: true,
        event: true,
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    // Check permissions
    if (address.post && address.post.createdById !== userId) {
      throw new BadRequestException(
        'You do not have permission to remove this address',
      );
    }

    if (address.event && address.event.createdById !== userId) {
      throw new BadRequestException(
        'You do not have permission to remove this address',
      );
    }

    // Delete the address
    await this.prisma.address.delete({
      where: { id },
    });

    return true;
  }
}
