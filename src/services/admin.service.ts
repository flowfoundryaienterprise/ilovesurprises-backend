import { prisma } from '../lib/prisma';
import { UpdateUserDTO, UpdateUserRoleDTO, ListUsersQueryDTO } from '../types/admin.types';
import { UserResponseDTO } from '../types/auth.types';
import { Prisma, User } from '@prisma/client';

export const formatUser = (user: User): UserResponseDTO => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const listUsers = async (query: ListUsersQueryDTO): Promise<{
  users: UserResponseDTO[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.max(1, Math.min(100, query.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (query.role) {
    where.role = query.role;
  }

  if (query.search) {
    const searchTerm = query.search.trim();
    where.OR = [
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    users: users.map(formatUser),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserById = async (userId: string): Promise<UserResponseDTO> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return formatUser(user);
};

export const updateUser = async (userId: string, data: UpdateUserDTO): Promise<UserResponseDTO> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return formatUser(updatedUser);
};

export const updateUserRole = async (userId: string, data: UpdateUserRoleDTO): Promise<UserResponseDTO> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: data.role },
  });

  return formatUser(updatedUser);
};

// Object alias for backward compatibility
export const adminService = {
  formatUser,
  listUsers,
  getUserById,
  updateUser,
  updateUserRole,
};
