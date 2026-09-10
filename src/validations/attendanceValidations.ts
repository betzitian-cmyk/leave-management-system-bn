// src/validations/attendanceValidations.ts

import Joi from 'joi';

export const createAttendanceValidation = {
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        'string.pattern.base': 'Date must be in YYYY-MM-DD format',
      }),
    status: Joi.string().valid('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE').optional(),
    checkInTime: Joi.string()
      .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        'string.pattern.base': 'Check-in time must be in HH:MM format',
      }),
    checkOutTime: Joi.string()
      .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        'string.pattern.base': 'Check-out time must be in HH:MM format',
      }),
    notes: Joi.string().optional(),
    fingerprintTemplate: Joi.string().optional(),
  }),
};

export const updateAttendanceValidation = {
  body: Joi.object({
    status: Joi.string().valid('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE').optional(),
    checkInTime: Joi.string()
      .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        'string.pattern.base': 'Check-in time must be in HH:MM format',
      }),
    checkOutTime: Joi.string()
      .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .optional()
      .messages({
        'string.pattern.base': 'Check-out time must be in HH:MM format',
      }),
    notes: Joi.string().optional(),
  }),
};
