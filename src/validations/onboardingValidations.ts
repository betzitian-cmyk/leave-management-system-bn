import Joi from 'joi';

export const createOnboardingValidation = {
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    startDate: Joi.date().min('now').required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    assignedTo: Joi.string().uuid().required(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const updateOnboardingValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    startDate: Joi.date().min('now').optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    assignedTo: Joi.string().uuid().optional(),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const getOnboardingByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const searchOnboardingsValidation = {
  query: Joi.object({
    employeeId: Joi.string().uuid().optional(),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
    assignedTo: Joi.string().uuid().optional(),
    startDateFrom: Joi.date().optional(),
    startDateTo: Joi.date().min(Joi.ref('startDateFrom')).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const createOnboardingTaskValidation = {
  body: Joi.object({
    onboardingId: Joi.string().uuid().required(),
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().max(500).optional(),
    dueDate: Joi.date().min('now').required(),
    assignedTo: Joi.string().uuid().required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
    category: Joi.string()
      .valid('DOCUMENTATION', 'TRAINING', 'EQUIPMENT', 'ACCESS', 'OTHER')
      .required(),
  }),
};

export const updateOnboardingTaskValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().max(500).optional(),
    dueDate: Joi.date().min('now').optional(),
    assignedTo: Joi.string().uuid().optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    category: Joi.string()
      .valid('DOCUMENTATION', 'TRAINING', 'EQUIPMENT', 'ACCESS', 'OTHER')
      .optional(),
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
  }),
};

export const getOnboardingTaskByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};
