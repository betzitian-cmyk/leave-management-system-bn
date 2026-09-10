// src/routes/authRoutes.ts

import express from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/authController';
import { authenticateToken, authorize } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  registerValidation,
  loginValidation,
  googleAuthValidation,
  refreshTokenValidation,
  updateUserRoleValidation,
  updateUserStatusValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  resendVerificationValidation,
  userIdValidation,
} from '../validations/authValidations';

const router = express.Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post(
  '/register',
  validateRequest(registerValidation),
  authController.register.bind(authController),
);
router.post('/login', validateRequest(loginValidation), authController.login.bind(authController));
router.post(
  '/refresh',
  validateRequest(refreshTokenValidation),
  authController.refreshToken.bind(authController),
);

// Password reset and email verification
router.post(
  '/forgot-password',
  validateRequest(forgotPasswordValidation),
  authController.forgotPassword.bind(authController),
);
router.post(
  '/reset-password',
  validateRequest(resetPasswordValidation),
  authController.resetPassword.bind(authController),
);
router.get(
  '/verify-email/:token',
  validateRequest(verifyEmailValidation),
  authController.verifyEmail.bind(authController),
);
router.post(
  '/resend-verification',
  validateRequest(resendVerificationValidation),
  authController.resendVerification.bind(authController),
);

// Google OAuth routes (handled by Passport)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.googleCallback.bind(authController),
);

// Protected routes (authentication required)
router.post('/logout', authenticateToken, authController.logout.bind(authController));
router.get('/me', authenticateToken, authController.getUserInfo.bind(authController));

// GUEST user status route - for checking if user needs employee profile
router.get('/status', authenticateToken, authController.getUserStatus.bind(authController));

// User management routes (Admin/HR Manager only)
router.get(
  '/users',
  authenticateToken,
  authorize(['ADMIN', 'HR_MANAGER']),
  authController.getAllUsers.bind(authController),
);
router.put(
  '/users/:userId/roles',
  authenticateToken,
  authorize(['ADMIN']),
  validateRequest(userIdValidation),
  validateRequest(updateUserRoleValidation),
  authController.updateUserRole.bind(authController),
);
router.put(
  '/users/:userId/status',
  authenticateToken,
  authorize(['ADMIN']),
  validateRequest(userIdValidation),
  validateRequest(updateUserStatusValidation),
  authController.updateUserStatus.bind(authController),
);
router.delete(
  '/users/:userId',
  authenticateToken,
  authorize(['ADMIN']),
  validateRequest(userIdValidation),
  authController.deleteUser.bind(authController),
);

export default router;
