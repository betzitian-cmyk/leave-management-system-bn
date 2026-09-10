import { Request, Response } from 'express';
import { ProfileService } from '../services/profileService';
import { AuthService } from '../services/authService';

export class ProfileController {
  private profileService: ProfileService;
  private authService: AuthService;

  constructor() {
    this.profileService = new ProfileService();
    this.authService = new AuthService();
  }

  /**
   * Get current user's profile
   */
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const userProfile = await this.authService.getUserInfo(userId);

      res.status(200).json({
        success: true,
        data: userProfile,
        message: 'User profile retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
        error: error.message,
      });
    }
  }

  /**
   * Update current user's profile (unified - handles both data and picture)
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const updates = req.body;
      const profilePictureFile = (req as any).file; // File from multer middleware

      // Update profile with both data and optional picture
      const result = await this.profileService.updateProfile(userId, updates, profilePictureFile);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to update profile',
          error: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.data,
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message,
      });
    }
  }

  /**
   * Delete profile picture only
   */
  async deleteProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const result = await this.profileService.deleteProfilePicture(userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to delete profile picture',
          error: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile picture deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete profile picture',
        error: error.message,
      });
    }
  }
}
