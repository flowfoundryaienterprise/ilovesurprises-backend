import { prisma } from '../lib/prisma';
import { CreateAddressDTO, UpdateAddressDTO, AddressResponseDTO } from '../types/address.types';

export class AddressesService {
  async listAddresses(userId: string): Promise<AddressResponseDTO[]> {
    const addresses = await prisma.customerAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses;
  }

  async getAddressById(userId: string, addressId: string): Promise<AddressResponseDTO> {
    const address = await prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      const error: any = new Error('Address not found');
      error.statusCode = 404;
      throw error;
    }

    return address;
  }

  async createAddress(userId: string, data: CreateAddressDTO): Promise<AddressResponseDTO> {
    return prisma.$transaction(async (tx) => {
      const existingCount = await tx.customerAddress.count({
        where: { userId },
      });

      const shouldBeDefault = data.isDefault || existingCount === 0;

      if (shouldBeDefault && existingCount > 0) {
        await tx.customerAddress.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await tx.customerAddress.create({
        data: {
          userId,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country || 'US',
          isDefault: shouldBeDefault,
        },
      });

      return address;
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: UpdateAddressDTO
  ): Promise<AddressResponseDTO> {
    await this.getAddressById(userId, addressId);

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.customerAddress.updateMany({
          where: { userId, isDefault: true, id: { not: addressId } },
          data: { isDefault: false },
        });
      }

      const updated = await tx.customerAddress.update({
        where: { id: addressId },
        data: {
          ...(data.firstName !== undefined && { firstName: data.firstName }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 }),
          ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.state !== undefined && { state: data.state }),
          ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
          ...(data.country !== undefined && { country: data.country }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        },
      });

      return updated;
    });
  }

  async deleteAddress(userId: string, addressId: string): Promise<{ success: boolean; message: string }> {
    const address = await this.getAddressById(userId, addressId);

    await prisma.$transaction(async (tx) => {
      await tx.customerAddress.delete({
        where: { id: addressId },
      });

      if (address.isDefault) {
        const nextAddress = await tx.customerAddress.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (nextAddress) {
          await tx.customerAddress.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<AddressResponseDTO> {
    await this.getAddressById(userId, addressId);

    return prisma.$transaction(async (tx) => {
      await tx.customerAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      const updated = await tx.customerAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      return updated;
    });
  }
}

export const addressesService = new AddressesService();
