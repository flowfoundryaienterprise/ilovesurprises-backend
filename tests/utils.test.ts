import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../src/utils/hash';
import { signToken, verifyToken } from '../src/utils/jwt';

describe('Security & Crypto Utilities', () => {
  describe('Hash Utility', () => {
    it('should hash a password and verify matching plain text', async () => {
      const password = 'SuperSecretPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);

      const isWrong = await comparePassword('WrongPassword123!', hash);
      expect(isWrong).toBe(false);
    });
  });

  describe('JWT Utility', () => {
    it('should sign and verify valid JWT token payload', () => {
      const payload = { id: 'user-123', email: 'test@example.com', role: 'CUSTOMER' };
      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyToken<typeof payload>(token);
      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe(payload.id);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    it('should return null for malformed or invalid token', () => {
      const invalidToken = 'invalid.jwt.token.string';
      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });
  });
});
