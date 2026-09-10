import Joi from 'joi';

export const searchEmployeesValidation = {
  query: Joi.object({
    departmentId: Joi.string().uuid().optional(),
    position: Joi.string().valid('EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN').optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ON_LEAVE').optional(),
    hireDateFrom: Joi.date().optional(),
    hireDateTo: Joi.date().min(Joi.ref('hireDateFrom')).optional(),
    searchTerm: Joi.string().min(2).max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const getEmployeeDetailsValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const updateEmployeeHRValidation = {
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
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ON_LEAVE').optional(),
    hireDate: Joi.date().max('now').optional(),
    terminationDate: Joi.date().min(Joi.ref('hireDate')).optional(),
  }),
};

export const getDepartmentPerformanceValidation = {
  params: Joi.object({
    departmentId: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    year: Joi.number().integer().min(2020).max(2030).default(new Date().getFullYear()),
    month: Joi.number().integer().min(1).max(12).optional(),
  }),
};
