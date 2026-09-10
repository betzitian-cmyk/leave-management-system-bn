import Joi from 'joi';

export const updateProfileValidation = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(50).allow('').optional(),
    lastName: Joi.string().min(2).max(50).allow('').optional(),
    // profilePicture will be handled by multer middleware
  }).custom((value, helpers) => {
    // Clean up empty strings to undefined
    if (value.firstName === '') {
      delete value.firstName;
    }
    if (value.lastName === '') {
      delete value.lastName;
    }
    return value;
  }),
};
