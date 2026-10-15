import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
const mocks = vi.hoisted(() => ({ verify: vi.fn(), tokenInfo: vi.fn(), findUser: vi.fn(), createUser: vi.fn() }));
vi.mock('google-auth-library', () => ({ OAuth2Client: class {
  verifyIdToken = mocks.verify; getTokenInfo = mocks.tokenInfo;
} }));
vi.mock('../../src/lib/prisma', () => ({ prisma: { user: { findUnique: mocks.findUser, create: mocks.createUser } } }));
import { createApp } from '../../src/app';
import { googleLogin, verifyGoogleIdToken } from '../../src/services/auth.service';
import { signToken } from '../../src/utils/jwt';
import { sanitizePng, saveBase64Image } from '../../src/middlewares/upload.middleware';
const app = createApp();
const payload = () => ({ sub: 'google-user', email: 'verified@example.com', email_verified: true,
  aud: process.env.GOOGLE_CLIENT_ID, iss: 'https://accounts.google.com', exp: Math.floor(Date.now()/1000)+600 });
beforeEach(() => vi.resetAllMocks());
describe('authentication trust boundary', () => {
  it('rejects email-only login without querying accounts', async () => {
    const res = await request(app).post('/api/auth/google').send({ email: 'admin@example.com', role: 'ADMIN' });
    expect(res.status).toBe(400); expect(mocks.findUser).not.toHaveBeenCalled();
    await expect(googleLogin({ email: 'admin@example.com' })).rejects.toMatchObject({ statusCode: 401 });
  });
  it.each([
    { aud: 'attacker-client' }, { iss: 'https://attacker.example' }, { exp: 1 },
    { email_verified: false }, { sub: '' },
  ])('rejects untrusted claims %j', async (claims) => {
    mocks.verify.mockResolvedValue({ getPayload: () => ({ ...payload(), ...claims }) });
    await expect(verifyGoogleIdToken('token')).rejects.toMatchObject({ statusCode: 401 });
  });
  it('rejects invalid signatures without a tokeninfo fallback', async () => {
    mocks.verify.mockRejectedValue(new Error('signature invalid'));
    await expect(verifyGoogleIdToken('forged')).rejects.toMatchObject({ statusCode: 401 });
  });
  it('ignores browser identity and refuses disabled accounts', async () => {
    mocks.verify.mockResolvedValue({ getPayload: payload });
    mocks.findUser.mockResolvedValue({ id: 'disabled', isActive: false });
    await expect(googleLogin({ idToken: 'token', email: 'forged@example.com', firstName: 'Admin' })).rejects.toMatchObject({ statusCode: 401 });
    expect(mocks.findUser).toHaveBeenCalledWith({ where: { email: 'verified@example.com' } });
    expect(mocks.createUser).not.toHaveBeenCalled();
  });
  it('does not accept a password reset token as an access token', async () => {
    const token = signToken({ id: 'victim', purpose: 'password_reset' });
    expect((await request(app).get('/api/users/me').set('Authorization', 'Bearer '+token)).status).toBe(401);
    expect(mocks.findUser).not.toHaveBeenCalled();
  });
});
describe('upload authorization and parsing', () => {
  it.each(['/api/upload', '/api/storefront/upload', '/api/storefront/upload-image'])('protects %s', async (url) => {
    expect((await request(app).post(url).send({ image: 'data:image/svg+xml;base64,PHN2Zz4=' })).status).toBe(401);
    mocks.findUser.mockResolvedValue({ id: 'customer', role: 'CUSTOMER', isActive: true });
    expect((await request(app).post(url).set('Authorization', 'Bearer '+signToken({ id: 'customer' })).send({})).status).toBe(403);
  });
  it('rejects SVG, spoofed images and oversized input', async () => {
    await expect(saveBase64Image('data:image/svg+xml;base64,PHN2Zz4=')).rejects.toThrow();
    expect(() => sanitizePng(Buffer.from('<script>alert(1)</script>'))).toThrow();
    expect(() => sanitizePng(Buffer.alloc(6*1024*1024))).toThrow();
  });
});
