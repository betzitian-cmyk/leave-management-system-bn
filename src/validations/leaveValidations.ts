import Joi from 'joi';

export const createLeaveRequestValidation = {
  body: Joi.object({
    leaveTypeId: Joi.string().uuid().required(),
    startDate: Joi.date().min('now').required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    reason: Joi.string().min(10).max(500).required(),
  }),
};

export const updateLeaveRequestValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    startDate: Joi.date().min('now').optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    reason: Joi.string().min(10).max(500).optional(),
  }),
};

export const approveLeaveRequestValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    comments: Joi.string().max(200).optional(),
  }),
};

export const rejectLeaveRequestValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    reason: Joi.string().min(10).max(200).required(),
  }),
};

export const cancelLeaveRequestValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    reason: Joi.string().min(10).max(200).optional(),
  }),
};

export const getLeaveRequestByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const getLeavesByDepartmentValidation = {
  params: Joi.object({
    departmentId: Joi.string().uuid().required(),
  }),
};

export const createLeaveTypeValidation = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(200).optional(),
    defaultDays: Joi.number().integer().min(0).max(365).required(),
    color: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .optional(),
    active: Joi.boolean().default(true),
  }),
};

export const updateLeaveTypeValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    description: Joi.string().max(200).optional(),
    defaultDays: Joi.number().integer().min(0).max(365).optional(),
    color: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .optional(),
    active: Joi.boolean().optional(),
  }),
};

export const getLeaveTypeByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const deleteLeaveTypeValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const adjustLeaveBalanceValidation = {
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    leaveTypeId: Joi.string().uuid().required(),
    adjustment: Joi.number().integer().required(),
    reason: Joi.string().min(10).max(200).required(),
  }),
};

export const getEmployeeLeaveBalancesValidation = {
  params: Joi.object({
    employeeId: Joi.string().uuid().required(),
  }),
};

export const getAllLeavesValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED').optional(),
    leaveTypeId: Joi.string().uuid().optional(),
    departmentId: Joi.string().uuid().optional(),
    employeeId: Joi.string().uuid().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
  }),
};

export const getMyLeavesValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED').optional(),
    leaveTypeId: Joi.string().uuid().optional(),
    year: Joi.number().integer().min(2020).max(2050).optional(),
  }),
};
