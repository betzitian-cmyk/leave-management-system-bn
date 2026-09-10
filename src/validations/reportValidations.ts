import Joi from 'joi';

export const getLeaveByDepartmentValidation = {
  query: Joi.object({
    year: Joi.number().integer().min(2020).max(2030).default(new Date().getFullYear()),
    month: Joi.number().integer().min(1).max(12).optional(),
  }),
};

export const getLeaveByEmployeeValidation = {
  params: Joi.object({
    employeeId: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    year: Joi.number().integer().min(2020).max(2030).default(new Date().getFullYear()),
  }),
};

export const getLeaveByTypeValidation = {
  query: Joi.object({
    year: Joi.number().integer().min(2020).max(2030).default(new Date().getFullYear()),
  }),
};

export const getLeaveCalendarValidation = {
  query: Joi.object({
    departmentId: Joi.string().uuid().optional(),
    month: Joi.number().integer().min(1).max(12).optional(),
    year: Joi.number().integer().min(2020).max(2030).default(new Date().getFullYear()),
  }),
};

export const exportToCsvValidation = {
  query: Joi.object({
    reportType: Joi.string().valid('DEPARTMENT', 'EMPLOYEE', 'TYPE', 'CALENDAR').required(),
    departmentId: Joi.string().uuid().optional(),
    year: Joi.number().integer().min(2020).max(2030).default(new Date().getFullYear()),
    month: Joi.number().integer().min(1).max(12).optional(),
  }),
};

export const exportToExcelValidation = {
  query: Joi.object({
    reportType: Joi.string().valid('DEPARTMENT', 'EMPLOYEE', 'TYPE', 'CALENDAR').required(),
    departmentId: Joi.string().uuid().optional(),
    year: Joi.number().integer().min(2020).max(2030).default(new Date().getFullYear()),
    month: Joi.number().integer().min(1).max(12).optional(),
  }),
};
