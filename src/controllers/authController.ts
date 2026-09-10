// src/controllers/authController.ts

import { Request, Response } from 'express';
import {
  AuthService,
  LoginCredentials,
  RegisterCredentials,
  GoogleAuthData,
} from '../services/authService';
import { getRepository } from 'typeorm';
import { Employee } from '../models/Employee';
import { User } from '../models/User';

export class AuthController {
  private authService = new AuthService();

  async register(req: Request, res: Response): Promise<void> {
    try {
      const credentials: RegisterCredentials = req.body;

      const result = await this.authService.register(credentials);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Registration failed',
          error: result.error,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message:
          'User registered successfully with GUEST role. Please verify your email before logging in.',
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;

      const result = await this.authService.login(credentials);

      if (!result.success) {
        res.status(401).json({
          success: false,
          message: 'Login failed',
          error: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result.data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      // This method is now handled by Passport middleware
      res.status(200).json({
        success: true,
        message: 'Google authentication initiated',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Google authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      await this.authService.logout(userId, accessToken);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const userInfo = await this.authService.getUserInfo(userId);

      if (!userInfo) {
        res.status(404).json({
          success: false,
          message: 'User profile not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: userInfo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve user profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const updates = req.body;

      // Only allow updating specific fields
      const allowedUpdates = {
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
      };

      const updatedUser = await this.authService.updateUserProfile(userId, allowedUpdates);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getUserInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const userInfo = await this.authService.getUserInfo(userId);

      if (!userInfo) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User info retrieved successfully',
        data: userInfo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user info',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const userInfo = await this.authService.getUserInfo(userId);
      const employeeRepository = getRepository(Employee);
      const userRepository = getRepository(User);

      // Get full user details for email verification status
      const fullUser = await userRepository.findOne({
        where: { id: userId },
        relations: ['role'],
      });

      // Check if user has employee profile
      const hasEmployeeProfile = await employeeRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!userInfo || !fullUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          userId: userInfo.id,
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          role: userInfo.role,
          emailVerified: fullUser.emailVerified,
          hasEmployeeProfile: !!hasEmployeeProfile,
          needsEmployeeProfile: userInfo.role === 'GUEST' && !hasEmployeeProfile,
          status:
            userInfo.role === 'GUEST'
              ? hasEmployeeProfile
                ? 'PENDING_APPROVAL'
                : 'GUEST_AWAITING_PROFILE'
              : 'ACTIVE_EMPLOYEE',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get user status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { roleIds } = req.body;

      if (!roleIds || !Array.isArray(roleIds)) {
        res.status(400).json({
          success: false,
          message: 'Role IDs array is required',
        });
        return;
      }

      const updatedUser = await this.authService.updateUserRole(userId, roleIds);

      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user role',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required',
        });
        return;
      }

      const updatedUser = await this.authService.updateUserStatus(userId, status);

      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.authService.getAllUsers();
      const employeeRepository = getRepository(Employee);

      // Map users to include employee information (if it exists)
      const mappedUsers = await Promise.all(
        users.map(async (user) => {
          // Find employee record for this user
          const employee = await employeeRepository.findOne({
            where: { user: { id: user.id } },
            relations: ['department'],
          });

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role?.name || '',
            status: user.status,
            profilePicture: user.profilePicture,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            employeeId: employee?.id || null,
            department: employee?.department?.name || 'Not Assigned',
            position: employee?.position || 'Not Assigned',
            hasEmployeeRecord: !!employee,
          };
        }),
      );

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: mappedUsers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId as string;

      await this.authService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await this.authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent if account exists',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process password reset',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Token and new password are required',
        });
        return;
      }

      await this.authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reset password',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params.token as string;

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Verification token is required',
        });
        return;
      }

      await this.authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify email',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await this.authService.resendVerification(email);

      res.status(200).json({
        success: true,
        message: 'Verification email sent',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resend verification',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Authorization code is required',
        });
        return;
      }

      const result = await this.authService.handleGoogleCallback(code);

      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Google authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
