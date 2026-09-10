import cloudinary, {
  cloudinaryUploadOptions,
  profilePictureOptions,
  documentOptions,
} from '../config/cloudinary';
import { promisify } from 'util';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

export interface CloudinaryDeleteResult {
  result: string;
}

export class CloudinaryService {
  /**
   * Upload a file to Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    options: any = cloudinaryUploadOptions,
  ): Promise<CloudinaryUploadResult> {
    try {
      // Convert buffer to base64 for Cloudinary
      const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const uploadResult = await cloudinary.uploader.upload(base64File, {
        ...options,
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      });

      return {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        format: uploadResult.format,
        resource_type: uploadResult.resource_type,
        bytes: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
      };
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload a profile picture with specific transformations
   */
  async uploadProfilePicture(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    return this.uploadFile(file, profilePictureOptions);
  }

  /**
   * Upload a document with specific options
   */
  async uploadDocument(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    return this.uploadFile(file, documentOptions);
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(
    publicId: string,
    resourceType: string = 'auto',
  ): Promise<CloudinaryDeleteResult> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      return { result: result.result };
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file information from Cloudinary
   */
  async getFileInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Error getting file info from Cloudinary:', error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Generate a signed upload URL for direct client uploads
   */
  generateUploadSignature(folder: string = 'leave-management-system'): {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
  } {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET || '',
    );

    return {
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      folder,
    };
  }

  /**
   * Transform image URL (for profile pictures, thumbnails, etc.)
   */
  transformImageUrl(publicId: string, transformations: any = {}): string {
    return cloudinary.url(publicId, {
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
        ...transformations,
      ],
    });
  }

  /**
   * Generate thumbnail URL for documents
   */
  generateThumbnailUrl(publicId: string, resourceType: string = 'auto'): string {
    if (resourceType === 'image') {
      return cloudinary.url(publicId, {
        transformation: [{ width: 200, height: 200, crop: 'fill' }, { quality: 'auto:good' }],
      });
    }

    // For non-image files, return a placeholder or icon
    return `https://via.placeholder.com/200x200/cccccc/666666?text=${resourceType.toUpperCase()}`;
  }
}
