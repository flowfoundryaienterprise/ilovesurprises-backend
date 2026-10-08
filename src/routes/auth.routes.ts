import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validation/auth.validation';

export const authRouter = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: SecretPass123
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Doe
 *     responses:
 *       201:
 *         description: Account created successfully.
 *       400:
 *         description: Validation failed.
 *       409:
 *         description: Email already registered.
 */
authRouter.post('/register', validateRequest(registerSchema), (req, res, next) => {
  authController.register(req, res, next);
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and issue JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecretPass123
 *     responses:
 *       200:
 *         description: Logged in successfully.
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Invalid credentials.
 */
authRouter.post('/login', validateRequest(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     summary: Authenticate or register with Google OAuth
 *     description: Verifies Google credential/idToken or accessToken, extracts user's first name and last name, creates or links account, and returns authenticated user with JWT.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token or credential JWT
 *               credential:
 *                 type: string
 *                 description: Alternative field for Google One Tap credential JWT
 *               accessToken:
 *                 type: string
 *                 description: Google OAuth2 access token
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated with Google.
 *       400:
 *         description: Validation failed or invalid Google token.
 *       401:
 *         description: Inactive user account.
 */
authRouter.post('/google', validateRequest(googleLoginSchema), (req, res, next) => {
  authController.googleLogin(req, res, next);
});


/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user details
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details.
 *       401:
 *         description: Unauthorized.
 */
authRouter.get('/me', authenticate, (req, res, next) => {
  authController.getMe(req, res, next);
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user session
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully.
 */
authRouter.post('/logout', authenticate, (req, res, next) => {
  authController.logout(req, res, next);
});

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *     responses:
 *       200:
 *         description: Password reset request processed.
 */
authRouter.post('/forgot-password', validateRequest(forgotPasswordSchema), (req, res, next) => {
  authController.forgotPassword(req, res, next);
});

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset account password using token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: NewSecretPass456
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400:
 *         description: Invalid or expired reset token.
 */
authRouter.post('/reset-password', validateRequest(resetPasswordSchema), (req, res, next) => {
  authController.resetPassword(req, res, next);
});
