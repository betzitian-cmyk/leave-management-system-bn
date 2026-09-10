import Joi from 'joi';

export const registerValidation = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
    roleIds: Joi.array().items(Joi.string().uuid()).optional().messages({
      'array.base': 'Role IDs must be an array',
      'string.guid': 'Role ID must be a valid UUID',
    }),
  }),
};

export const loginValidation = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};

export const googleAuthValidation = {
  body: Joi.object({
    googleId: Joi.string().required().messages({
      'any.required': 'Google ID is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
    profilePicture: Joi.string().uri().optional().messages({
      'string.uri': 'Profile picture must be a valid URL',
    }),
  }),
};

export const refreshTokenValidation = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required',
    }),
  }),
};

export const updateUserRoleValidation = {
  body: Joi.object({
    roleIds: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
      'array.base': 'Role IDs must be an array',
      'array.min': 'At least one role ID is required',
      'any.required': 'Role IDs are required',
      'string.guid': 'Role ID must be a valid UUID',
    }),
  }),
};

export const updateUserStatusValidation = {
  body: Joi.object({
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING').required().messages({
      'any.only': 'Status must be one of: ACTIVE, INACTIVE, SUSPENDED, PENDING',
      'any.required': 'Status is required',
    }),
  }),
};

export const forgotPasswordValidation = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),
};

export const resetPasswordValidation = {
  body: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required',
    }),
    newPassword: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'New password is required',
    }),
  }),
};

export const verifyEmailValidation = {
  params: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Verification token is required',
    }),
  }),
};

export const resendVerificationValidation = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),
};

export const userIdValidation = {
  params: Joi.object({
    userId: Joi.string().uuid().required().messages({
      'string.guid': 'User ID must be a valid UUID',
      'any.required': 'User ID is required',
    }),
  }),
};
