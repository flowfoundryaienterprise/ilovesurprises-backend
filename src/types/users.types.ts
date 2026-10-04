export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
