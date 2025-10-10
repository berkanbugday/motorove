import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { FilterAddressInput } from './dto/filter-address.input';
import { AddressType } from '../enums/models/address-type.enum';
import { Language } from '../enums/models/language.enum';
import { Address } from './models/address.model';
import { AddressDto } from './dto/address.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    limit?: number,
    skip?: number,
    filters?: FilterAddressInput,
  ): Promise<AddressDto[]> {
    try {
      const addresses = await this.prisma.address.findMany({
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
      });

      return await Promise.all(
        addresses.map((address) => this.mapToDto(address as Address)),
      );
    } catch (error) {
      this.logger.error(`Failed to get addresses`, error);
      throw error;
    }
  }

  async findOne(id: string): Promise<AddressDto> {
    try {
      const address = await this.prisma.address.findFirst({
        where: { id },
        include: {
          post: true,
          event: true,
        },
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      return this.mapToDto(address as Address);
    } catch (error) {
      this.logger.error(`Failed to get address with ID ${id}`, error);
      throw error;
    }
  }

  async create(input: CreateAddressInput, userId: string): Promise<AddressDto> {
    try {
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
        const post = await this.prisma.post.findFirst({
          where: { id: input.postId },
        });

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
        const event = await this.prisma.event.findFirst({
          where: { id: input.eventId },
        });

        if (!event) {
          throw new NotFoundException(
            `Event with ID ${input.eventId} not found`,
          );
        }

        if (event.createdById !== userId) {
          throw new BadRequestException(
            'You do not have permission to add an address to this event',
          );
        }
      }

      // Create the address with type-safe handling of latitude and longitude
      const createdAddress = await this.prisma.address.create({
        data: {
          address: input.address,
          language: input.language,
          type: input.type,
          latitude: input.latitude,
          longitude: input.longitude,
          post: input.postId ? { connect: { id: input.postId } } : undefined,
          event: input.eventId ? { connect: { id: input.eventId } } : undefined,
        },
      });

      return this.mapToDto(createdAddress as Address);
    } catch (error) {
      this.logger.error(`Failed to create address`, error);
      throw error;
    }
  }

  async update(input: UpdateAddressInput, userId: string): Promise<AddressDto> {
    try {
      // First, find the address to check ownership
      const address = await this.prisma.address.findFirst({
        where: { id: input.id },
        include: {
          post: true,
          event: true,
        },
      });

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
      const updatedAddress = await this.prisma.address.update({
        where: { id: input.id },
        data: updateData,
      });

      return this.mapToDto(updatedAddress as Address);
    } catch (error) {
      this.logger.error(`Failed to update address`, error);
      throw error;
    }
  }

  async remove(id: string): Promise<AddressDto> {
    try {
      // Find address to check permissions
      const address = await this.prisma.address.findFirst({
        where: { id },
        include: {
          post: true,
          event: true,
        },
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      // Delete the address
      const deletedAddress = await this.prisma.address.delete({
        where: { id },
      });

      return this.mapToDto(deletedAddress as Address);
    } catch (error) {
      this.logger.error(`Failed to delete address`, error);
      throw error;
    }
  }

  private mapToDto(address: Address): AddressDto {
    return plainToClass(AddressDto, address);
  }
}
