import { UserRole } from '@prisma/client';

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UpdateUserRoleDTO {
  role: UserRole;
}

export interface ListUsersQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}
