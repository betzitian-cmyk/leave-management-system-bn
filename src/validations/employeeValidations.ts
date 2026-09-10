import Joi from 'joi';

export const createEmployeeProfileValidation = {
  body: Joi.object({
    userId: Joi.string().uuid().required().messages({
      'string.guid': 'User ID must be a valid UUID',
      'any.required': 'User ID is required',
    }),
    position: Joi.string().valid('EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN').required(),
    departmentId: Joi.string().uuid().required().messages({
      'string.guid': 'Department ID must be a valid UUID',
      'any.required': 'Department ID is required',
    }),
    hireDate: Joi.date().max('now').optional(),
    managerId: Joi.string().uuid().optional().messages({
      'string.guid': 'Manager ID must be a valid UUID',
    }),
  }),
};

export const updateEmployeeValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    position: Joi.string().valid('EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN').optional(),
    departmentId: Joi.string().uuid().optional(),
    managerId: Joi.string().uuid().optional(),
    profilePicture: Joi.string().uri().optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ON_LEAVE').optional(),
  }),
};

export const getEmployeeByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const getAllEmployeesValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    search: Joi.string().trim().max(100).optional(),
    departmentId: Joi.string().uuid().optional(),
    position: Joi.string().valid('EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN').optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE').optional(),
  }),
};
