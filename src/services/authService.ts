// src/services/authService.ts

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User, UserStatus, AuthProvider } from '../models/User';
import { Role } from '../models/Role';
import { Employee } from '../models/Employee';
import { AuditService } from './auditService';
import { EmailService } from './emailService';
import { Department } from '../models/Department';

// In-memory token blacklist (in production, use Redis or database)
const blacklistedTokens = new Set<string>();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
  isActive: boolean;
  lastLogin?: Date;
  emailVerified: boolean;
  employeeId?: string;
  department?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegistrationResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  message: string;
}

export interface GoogleAuthData {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  private readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  private readonly SALT_ROUNDS = 12;

  private auditService = new AuditService();
  private emailService = new EmailService();

  // Add token to blacklist
  private blacklistToken(token: string): void {
    blacklistedTokens.add(token);
  }

  // Check if token is blacklisted
  private isTokenBlacklisted(token: string): boolean {
    return blacklistedTokens.has(token);
  }

  // Clean up expired tokens from blacklist (run periodically)
  private cleanupBlacklist(): void {
    // In production, implement proper cleanup logic
    // For now, we'll keep it simple
  }

  async register(
    credentials: RegisterCredentials,
  ): Promise<{ success: boolean; data?: RegistrationResponse; error?: string }> {
    try {
      const userRepository = getRepository(User);
      const roleRepository = getRepository(Role);

      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { email: credentials.email },
      });
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(credentials.password, this.SALT_ROUNDS);

      // Create user
      const user = userRepository.create({
        email: credentials.email,
        password: hashedPassword,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        status: UserStatus.PENDING,
        authProvider: AuthProvider.LOCAL,
        emailVerified: false,
      });

      // Assign default GUEST role for new registrations
      if (!credentials.roleIds || credentials.roleIds.length === 0) {
        const guestRole = await roleRepository.findOne({
          where: { name: 'GUEST' },
        });
        if (guestRole) {
          user.role = guestRole;
          user.roleId = guestRole.id;
        }
      } else {
        // Assign specified roles (admin functionality)
        const roles = await roleRepository.findByIds(credentials.roleIds);
        user.role = roles[0]; // Take the first role since we only support one role per user
        user.roleId = roles[0].id;
      }

      const savedUser = await userRepository.save(user);

      // Generate email verification token
      const verificationToken = require('crypto').randomBytes(32).toString('hex');
      savedUser.emailVerificationToken = verificationToken;
      savedUser.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await userRepository.save(savedUser);

      // Send welcome email with verification link (for GUEST users)
      try {
        await this.emailService.sendWelcomeEmail(savedUser, verificationToken);
        console.info(`Welcome email sent to new GUEST user: ${savedUser.email}`);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }

      // Audit log - only log user creation for security
      await this.auditService.logSecurityEvent({
        userId: savedUser.id,
        action: 'CRITICAL_UPDATE',
        entityType: 'User',
        entityId: savedUser.id,
        description: `New user registered: ${savedUser.email}`,
      });

      return {
        success: true,
        data: {
          userId: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role?.name || 'GUEST',
          emailVerified: false,
          message:
            'Registration successful. Please check your email to verify your account before logging in.',
        },
      };
    } catch (error) {
      return { success: false, error: `Registration failed: ${error.message}` };
    }
  }

  async login(
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    try {
      const userRepository = getRepository(User);

      // Find user by email
      const user = await userRepository.findOne({
        where: { email: credentials.email },
        relations: ['role'],
      });

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      if (user.status !== UserStatus.ACTIVE) {
        return { success: false, error: 'Account is not active' };
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return {
          success: false,
          error:
            'Please verify your email address before logging in. Check your inbox for the verification link.',
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Update user
      user.lastLogin = new Date();
      user.refreshToken = refreshToken;
      user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await userRepository.save(user);

      // Audit log - login event
      await this.auditService.logUserLogin(user.id);

      return {
        success: true,
        data: {
          token,
          refreshToken,
          expiresIn: 24 * 60 * 60, // 24 hours in seconds
        },
      };
    } catch (error) {
      return { success: false, error: `Login failed: ${error.message}` };
    }
  }

  // Google OAuth is now handled by Passport middleware
  // This method is kept for backward compatibility but not used
  async googleAuth(authData: GoogleAuthData): Promise<AuthResponse> {
    throw new Error('Google OAuth is now handled by Passport middleware');
  }

  async validateToken(token: string): Promise<{ valid: boolean; user: UserInfo | null }> {
    try {
      // Check if token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        return { valid: false, user: null };
      }

      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      const userRepository = getRepository(User);

      const user = await userRepository.findOne({
        where: { id: decoded.userId },
        relations: ['role'],
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        return { valid: false, user: null };
      }

      return { valid: true, user: this.mapUserToUserInfo(user) };
    } catch (error) {
      return { valid: false, user: null };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({
      where: { refreshToken },
      relations: ['role'],
    });

    if (!user || !user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if user is still active
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('User account is not active');
    }

    // Generate new tokens
    const newToken = this.generateToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    // Update user with new refresh token (token rotation)
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await userRepository.save(user);

    // Audit log - token refresh
    await this.auditService.logSecurityEvent({
      userId: user.id,
      action: 'CRITICAL_UPDATE',
      entityType: 'User',
      entityId: user.id,
      description: `Access token refreshed for user ${user.email}`,
    });

    return {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };
  }
  catch(error) {
    console.error('Error in refreshToken', { error: error.message, stack: error.stack });
    throw error;
  }

  async logout(userId: string, accessToken?: string): Promise<void> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (user) {
      // Clear refresh token from database
      user.refreshToken = null;
      user.refreshTokenExpires = null;
      await userRepository.save(user);

      // Blacklist the access token if provided
      if (accessToken) {
        this.blacklistToken(accessToken);
      }

      // Audit log - logout event
      await this.auditService.logUserLogout(user.id);
    }
  }

  async getUserInfo(userId: string): Promise<UserInfo | null> {
    const userRepository = getRepository(User);
    const employeeRepository = getRepository(Employee);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      return null;
    }

    // Try to find employee record for this user with department relation
    const employee = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ['department'],
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name || '',
      profilePicture: user.profilePicture,
      isActive: user.status === UserStatus.ACTIVE,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified || false,
      employeeId: employee?.id || null,
      department: employee?.department?.name || null,
    };
  }

  async updateUserProfile(userId: string, updates: Partial<UserInfo>): Promise<UserInfo> {
    const userRepository = getRepository(User);
    const employeeRepository = getRepository(Employee);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user fields (excluding email for security)
    if (updates.firstName) user.firstName = updates.firstName;
    if (updates.lastName) user.lastName = updates.lastName;
    // Note: Email updates are not allowed for security reasons

    const updatedUser = await userRepository.save(user);

    // Check if user has an employee record (employees depend on users)
    const employee = await employeeRepository.findOne({
      where: { user: { id: userId } },
    });

    return this.mapUserToUserInfo(updatedUser);
  }

  async updateUserRole(userId: string, roleIds: string[]): Promise<User> {
    const userRepository = getRepository(User);
    const roleRepository = getRepository(Role);

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const roles = await roleRepository.findByIds(roleIds);
    const oldRole = user.role?.name;

    user.role = roles[0];
    user.roleId = roles[0].id;
    const updatedUser = await userRepository.save(user);

    // Audit log
    await this.auditService.logRoleChange(user.id, user.id, oldRole, roles[0].name, userId);

    return updatedUser;
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<User> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const oldStatus = user.status;
    user.status = status;
    const updatedUser = await userRepository.save(user);

    // Audit log
    await this.auditService.logUserStatusChange(user.id, oldStatus, status, userId);

    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    const userRepository = getRepository(User);
    return await userRepository.find({
      relations: ['role', 'employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    const userRepository = getRepository(User);
    const employeeRepository = getRepository(Employee);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has system role
    const systemRoles = ['ADMIN'];
    const hasSystemRole = user.role?.name && systemRoles.includes(user.role.name);
    if (hasSystemRole) {
      throw new Error('Cannot delete user with system role');
    }

    // Delete associated employee record if it exists
    const employee = await employeeRepository.findOne({ where: { user: { id: userId } } });
    if (employee) {
      await employeeRepository.remove(employee);
    }

    // Audit log
    await this.auditService.logSecurityEvent({
      userId: user.id,
      action: 'CRITICAL_UPDATE',
      entityType: 'User',
      entityId: user.id,
      description: `User ${user.email} deleted`,
    });

    await userRepository.remove(user);
  }

  private generateToken(user: User): string {
    return (jwt as any).sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role?.name || '',
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN },
    );
  }

  private generateRefreshToken(user: User): string {
    return (jwt as any).sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN },
    );
  }

  private mapUserToUserInfo(user: User): UserInfo {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name || '',
      profilePicture: user.profilePicture,
      isActive: user.status === UserStatus.ACTIVE,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified || false,
      employeeId: undefined, // Will be populated separately when needed
    };
  }

  // Additional methods for email verification and password reset
  async forgotPassword(email: string): Promise<void> {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    // Generate password reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await userRepository.save(user);

    // Send password reset email
    try {
      await this.emailService.sendPasswordReset(user, resetToken);
      console.info(`Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails - token is still generated
      console.info(`Password reset token for ${email}: ${resetToken}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await userRepository.save(user);

    // Audit log
    await this.auditService.logPasswordReset(user.id);
  }

  async verifyEmail(token: string): Promise<void> {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new Error('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.status = UserStatus.ACTIVE;
    await userRepository.save(user);

    // Audit log
    await this.auditService.logSecurityEvent({
      userId: user.id,
      action: 'CRITICAL_UPDATE',
      entityType: 'User',
      entityId: user.id,
      description: `Email verified for user ${user.email}`,
    });
  }

  async resendVerification(email: string): Promise<void> {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists for security, but log it
      console.warn(`Resend verification requested for non-existent email: ${email}`);
      return; // Silently return for security
    }

    if (user.emailVerified) {
      console.info(`Resend verification requested for already verified email: ${email}`);
      throw new Error('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = require('crypto').randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await userRepository.save(user);

    // Send verification email using EmailService
    try {
      await this.emailService.sendEmailVerification(user, verificationToken);
      console.info(`✅ Verification email resent successfully to: ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError);
      throw new Error('Failed to send verification email');
    }
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    // This method is called after Passport successfully authenticates with Google
    // The user object should be available in req.user from Passport
    throw new Error('This method should not be called directly. Use Passport middleware.');
  }
}
