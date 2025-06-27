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
import { Address } from './models/address.model';
import { Post } from 'src/posts/models/post.model';
import { Event } from 'src/events/models/event.model';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    limit?: number,
    skip?: number,
    filters?: AddressFilterInput,
  ): Promise<Address[]> {
    const addresses = (await this.prisma.address.findMany({
      take: limit || undefined,
      skip: skip || undefined,
      where: {
        ...(filters?.postId && { postId: filters.postId }),
        ...(filters?.eventId && { eventId: filters.eventId }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.language && { language: filters.language }),
      },
      include: {
        post: true,
        event: true,
      },
    })) as unknown as Address[];

    return addresses;
  }

  async findOne(id: string): Promise<Address> {
    const address = (await this.prisma.address.findUnique({
      where: { id },
      include: {
        post: true,
        event: true,
      },
    })) as unknown as Address;

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async create(input: CreateAddressInput, userId: string): Promise<Address> {
    // Check if we are creating an address for a post or an event
    if (!input.postId && !input.eventId) {
      throw new BadRequestException(
        'Either postId or eventId must be provided',
      );
    }

    if (input.postId && input.eventId) {
      throw new BadRequestException(
        'Cannot associate address with both post and event',
      );
    }

    // If creating for a post, check if user owns the post
    if (input.postId) {
      const post = (await this.prisma.post.findUnique({
        where: { id: input.postId },
      })) as unknown as Post;

      if (!post) {
        throw new NotFoundException(`Post with ID ${input.postId} not found`);
      }

      if (post.createdById !== userId) {
        throw new BadRequestException(
          'You do not have permission to add an address to this post',
        );
      }
    }

    // If creating for an event, check if user owns the event
    if (input.eventId) {
      const event = (await this.prisma.event.findUnique({
        where: { id: input.eventId },
      })) as unknown as Event;

      if (!event) {
        throw new NotFoundException(`Event with ID ${input.eventId} not found`);
      }

      if (event.createdById !== userId) {
        throw new BadRequestException(
          'You do not have permission to add an address to this event',
        );
      }
    }

    // Create the address with type-safe handling of latitude and longitude
    const address = (await this.prisma.address.create({
      data: {
        address: input.address,
        language: input.language,
        type: input.type,
        latitude: input.latitude,
        longitude: input.longitude,
        post: input.postId ? { connect: { id: input.postId } } : undefined,
        event: input.eventId ? { connect: { id: input.eventId } } : undefined,
      },
    })) as unknown as Address;

    return address;
  }

  async update(input: UpdateAddressInput, userId: string): Promise<Address> {
    // First, find the address to check ownership
    const address = (await this.prisma.address.findUnique({
      where: { id: input.id },
      include: {
        post: true,
        event: true,
      },
    })) as unknown as Address;

    if (!address) {
      throw new NotFoundException(`Address with ID ${input.id} not found`);
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
    if (input.postId || input.eventId) {
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
    if (input.address !== undefined) {
      updateData.address = input.address;
    }

    if (input.language !== undefined) {
      updateData.language = input.language;
    }

    if (input.type !== undefined) {
      updateData.type = input.type;
    }

    if (input.latitude !== undefined) {
      updateData.latitude = input.latitude;
    }

    if (input.longitude !== undefined) {
      updateData.longitude = input.longitude;
    }

    // Update the address with the constructed data object
    const updatedAddress = (await this.prisma.address.update({
      where: { id: input.id },
      data: updateData,
    })) as unknown as Address;

    return updatedAddress;
  }

  async remove(id: string): Promise<Address> {
    // Find address to check permissions
    const address = (await this.prisma.address.findUnique({
      where: { id },
      include: {
        post: true,
        event: true,
      },
    })) as unknown as Address;

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    // Delete the address
    const deletedAddress = (await this.prisma.address.delete({
      where: { id },
    })) as unknown as Address;

    return deletedAddress;
  }
}
