import multer from 'multer';
import path from 'path';

// Configure multer for profile picture uploads
export const profilePictureUpload = multer({
  storage: multer.memoryStorage(), // Use memory storage for Cloudinary
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one file
  },
});

// Configure multer for document uploads
export const documentUpload = multer({
  storage: multer.memoryStorage(), // Use memory storage for Cloudinary
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files per request
  },
});

// Configure multer for general image uploads
export const imageUpload = multer({
  storage: multer.memoryStorage(), // Use memory storage for Cloudinary
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one file
  },
});

// Create a function to generate multer config with custom settings
export const createMulterConfig = (options: {
  maxFileSize?: number;
  maxFiles?: number;
  allowedMimeTypes?: string[];
  storage?: multer.StorageEngine;
}) => {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 1,
    allowedMimeTypes = ['*/*'], // Allow all types by default
    storage = multer.memoryStorage(),
  } = options;

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes('*/*') || allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`));
      }
    },
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
  });
};
