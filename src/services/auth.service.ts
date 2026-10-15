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

export const formatAuthUser = (user: User): UserResponseDTO => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = async (data: RegisterDTO): Promise<AuthResponseDTO> => {
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
    user: formatAuthUser(user),
    token,
  };
};

export const login = async (data: LoginDTO): Promise<AuthResponseDTO> => {
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
    user: formatAuthUser(user),
    token,
  };
};

export const getMe = async (userId: string): Promise<UserResponseDTO> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    const error: any = new Error('User not found or inactive');
    error.statusCode = 404;
    throw error;
  }

  return formatAuthUser(user);
};

export const forgotPassword = async (
  data: ForgotPasswordDTO
): Promise<{ message: string; resetToken?: string }> => {
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
};

export const resetPassword = async (data: ResetPasswordDTO): Promise<{ message: string }> => {
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
};

import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env';
import { GoogleLoginDTO } from '../types/auth.types';

const googleClient = new OAuth2Client(config.googleClientId);

const invalidGoogleToken = () => Object.assign(new Error('Invalid or expired Google token'), { statusCode: 401 });

export async function verifyGoogleIdToken(token: string): Promise<any> {
  if (!config.googleClientId) throw Object.assign(new Error('Google login is not configured'), { statusCode: 503 });
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: config.googleClientId });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email || payload.email_verified !== true ||
        payload.aud !== config.googleClientId ||
        !['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss) ||
        !payload.exp || payload.exp <= Date.now() / 1000) throw invalidGoogleToken();
    return payload;
  } catch { throw invalidGoogleToken(); }
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<any> {
  if (!config.googleClientId) throw Object.assign(new Error('Google login is not configured'), { statusCode: 503 });
  try {
    const info = await googleClient.getTokenInfo(accessToken);
    if (info.aud !== config.googleClientId || info.expiry_date <= Date.now()) throw invalidGoogleToken();
    const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: 'Bearer ' + accessToken }, signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) throw invalidGoogleToken();
    const payload = await resp.json() as any;
    if (!payload.sub || !payload.email || payload.email_verified !== true ||
        (info.sub && info.sub !== payload.sub)) throw invalidGoogleToken();
    return payload;
  } catch { throw invalidGoogleToken(); }
}

export const googleLogin = async (data: GoogleLoginDTO): Promise<AuthResponseDTO> => {
  const rawToken = data.idToken || data.credential;
  if (!rawToken && !data.accessToken) throw invalidGoogleToken();
  const payload = rawToken ? await verifyGoogleIdToken(rawToken) : await fetchGoogleUserInfo(data.accessToken!);
  const email = payload.email.toLowerCase().trim();
  const firstName = payload.given_name?.trim() || null;
  const lastName = payload.family_name?.trim() || null;

  // Look for existing user
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    if (!user.isActive) {
      const error: any = new Error('User account is inactive');
      error.statusCode = 401;
      throw error;
    }

    // Update missing firstName or lastName if provided by Google
    if ((!user.firstName && firstName) || (!user.lastName && lastName)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
        },
      });
    }
  } else {
    // Generate secure random password hash for OAuth user
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await hashPassword(randomPassword);

    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: UserRole.CUSTOMER,
        isActive: true,
      },
    });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: formatAuthUser(user),
    token,
  };
};

// Backward compatibility object export
export const authService = {
  formatUser: formatAuthUser,
  register,
  login,
  googleLogin,
  getMe,
  forgotPassword,
  resetPassword,
};

