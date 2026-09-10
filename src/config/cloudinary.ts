import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Cloudinary upload options
export const cloudinaryUploadOptions = {
  folder: process.env.CLOUDINARY_FOLDER || 'leave-management-system',
  resource_type: 'auto',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
  transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
};

// Profile picture specific options
export const profilePictureOptions = {
  folder: `${process.env.CLOUDINARY_FOLDER || 'leave-management-system'}/profile-pictures`,
  transformation: [
    { width: 300, height: 300, crop: 'fill', gravity: 'face' },
    { quality: 'auto:good' },
    { fetch_format: 'auto' },
  ],
};

// Document specific options
export const documentOptions = {
  folder: `${process.env.CLOUDINARY_FOLDER || 'leave-management-system'}/documents`,
  transformation: [{ quality: 'auto:good' }],
};
