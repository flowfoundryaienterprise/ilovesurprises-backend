import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken, verifyToken } from '../utils/jwt';
import {
  RegisterDTO,
  LoginDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  AuthResponseDTO,
  UserResponseDTO,
} from '../types/auth.types';
import { User, UserRole } from '@prisma/client';

export class AuthService {
  private formatUser(user: User): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    const normalizedEmail = data.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      const error: any = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: data.firstName?.trim() || null,
        lastName: data.lastName?.trim() || null,
        role: UserRole.CUSTOMER,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.formatUser(user),
      token,
    };
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const normalizedEmail = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.formatUser(user),
      token,
    };
  }

  async getMe(userId: string): Promise<UserResponseDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      const error: any = new Error('User not found or inactive');
      error.statusCode = 404;
      throw error;
    }

    return this.formatUser(user);
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<{ message: string; resetToken?: string }> {
    const normalizedEmail = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    const resetToken = signToken(
      { id: user.id, email: user.email, purpose: 'password_reset' },
      { expiresIn: '1h' }
    );

    return {
      message: 'If the email exists, a password reset link has been sent.',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

  async resetPassword(data: ResetPasswordDTO): Promise<{ message: string }> {
    const payload = verifyToken<{ id: string; email: string; purpose?: string }>(data.token);

    if (!payload || payload.purpose !== 'password_reset' || !payload.id) {
      const error: any = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.isActive) {
      const error: any = new Error('User not found or inactive');
      error.statusCode = 404;
      throw error;
    }

    const newPasswordHash = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return {
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }
}

export const authService = new AuthService();
