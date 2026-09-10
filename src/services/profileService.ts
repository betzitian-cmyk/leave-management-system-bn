import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { Employee } from '../models/Employee';
import { CloudinaryService } from './cloudinaryService';

export class ProfileService {
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.cloudinaryService = new CloudinaryService();
  }

  /**
   * Update user profile with optional profile picture
   */
  async updateProfile(
    userId: string,
    updates: any,
    profilePictureFile?: Express.Multer.File,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const userRepository = getRepository(User);
      const employeeRepository = getRepository(Employee);

      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['role'],
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Update user fields (excluding email for security)
      if (updates.firstName) user.firstName = updates.firstName;
      if (updates.lastName) user.lastName = updates.lastName;

      // Handle profile picture upload if provided
      if (profilePictureFile) {
        try {
          const uploadResult =
            await this.cloudinaryService.uploadProfilePicture(profilePictureFile);
          user.profilePicture = uploadResult.secure_url;
        } catch (error) {
          return { success: false, error: 'Failed to upload profile picture' };
        }
      }

      const updatedUser = await userRepository.save(user);

      // Check if user has an employee record (employees depend on users)
      const employee = await employeeRepository.findOne({
        where: { user: { id: userId } },
      });

      return {
        success: true,
        data: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture,
          role: updatedUser.role?.name,
          hasEmployeeRecord: !!employee,
        },
      };
    } catch (error) {
      return { success: false, error: `Failed to update profile: ${error.message}` };
    }
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userRepository = getRepository(User);

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user || !user.profilePicture) {
        return { success: true }; // No picture to delete - consider this success
      }

      // Extract public_id from Cloudinary URL for deletion
      const publicId = this.extractPublicId(user.profilePicture);
      if (publicId) {
        try {
          await this.cloudinaryService.deleteFile(publicId);
        } catch (error) {
          // Continue with local deletion even if Cloudinary deletion fails
        }
      }

      // Remove profile picture URL from user
      user.profilePicture = null;
      await userRepository.save(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to delete profile picture: ${error.message}` };
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  private extractPublicId(url: string): string | null {
    try {
      // Cloudinary URLs typically have the format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        // Skip version number and get folder/filename
        const folderAndFile = urlParts.slice(uploadIndex + 2).join('/');
        // Remove file extension
        return folderAndFile.split('.')[0];
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get user profile picture
   */
  async getUserProfilePicture(userId: string): Promise<string | null> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['profilePicture'],
    });

    return user?.profilePicture || null;
  }
}
