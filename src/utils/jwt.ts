import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export const signToken = (
  payload: string | object | Buffer,
  options?: SignOptions
): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: (options?.expiresIn ?? config.jwtExpiresIn) as SignOptions['expiresIn'],
    ...options,
  });
};

export const verifyToken = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as T;
  } catch {
    return null;
  }
};
