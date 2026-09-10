import Joi from 'joi';

export const getDocumentByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const uploadDocumentValidation = {
  params: Joi.object({
    leaveRequestId: Joi.string().uuid().required().messages({
      'string.guid': 'Leave request ID must be a valid UUID',
      'any.required': 'Leave request ID is required',
    }),
  }),
};

export const getDocumentsByLeaveRequestValidation = {
  params: Joi.object({
    leaveRequestId: Joi.string().uuid().required().messages({
      'string.guid': 'Leave request ID must be a valid UUID',
      'any.required': 'Leave request ID is required',
    }),
  }),
};
