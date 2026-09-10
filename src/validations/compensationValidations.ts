import Joi from 'joi';

export const createSalaryValidation = {
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    baseSalary: Joi.number().positive().required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
    effectiveDate: Joi.date().max('now').required(),
    type: Joi.string().valid('HOURLY', 'SALARY', 'COMMISSION').required(),
    frequency: Joi.string().valid('WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'ANNUALLY').required(),
    benefits: Joi.array().items(Joi.string().uuid()).optional(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const updateSalaryValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    baseSalary: Joi.number().positive().optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP').optional(),
    effectiveDate: Joi.date().max('now').optional(),
    type: Joi.string().valid('HOURLY', 'SALARY', 'COMMISSION').optional(),
    frequency: Joi.string().valid('WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'ANNUALLY').optional(),
    benefits: Joi.array().items(Joi.string().uuid()).optional(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const getSalaryByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const searchSalariesValidation = {
  query: Joi.object({
    employeeId: Joi.string().uuid().optional(),
    departmentId: Joi.string().uuid().optional(),
    type: Joi.string().valid('HOURLY', 'SALARY', 'COMMISSION').optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP').optional(),
    effectiveDateFrom: Joi.date().optional(),
    effectiveDateTo: Joi.date().min(Joi.ref('effectiveDateFrom')).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const createBenefitValidation = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    type: Joi.string()
      .valid('HEALTH', 'DENTAL', 'VISION', 'LIFE', 'DISABILITY', 'RETIREMENT', 'OTHER')
      .required(),
    cost: Joi.number().positive().required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
    frequency: Joi.string().valid('MONTHLY', 'ANNUALLY', 'ONE_TIME').required(),
    active: Joi.boolean().default(true),
  }),
};

export const updateBenefitValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    type: Joi.string()
      .valid('HEALTH', 'DENTAL', 'VISION', 'LIFE', 'DISABILITY', 'RETIREMENT', 'OTHER')
      .optional(),
    cost: Joi.number().positive().optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP').optional(),
    frequency: Joi.string().valid('MONTHLY', 'ANNUALLY', 'ONE_TIME').optional(),
    active: Joi.boolean().optional(),
  }),
};

export const getBenefitByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const searchBenefitsValidation = {
  query: Joi.object({
    type: Joi.string()
      .valid('HEALTH', 'DENTAL', 'VISION', 'LIFE', 'DISABILITY', 'RETIREMENT', 'OTHER')
      .optional(),
    active: Joi.boolean().optional(),
    searchTerm: Joi.string().min(2).max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const assignBenefitToEmployeeValidation = {
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    benefitId: Joi.string().uuid().required(),
    effectiveDate: Joi.date().max('now').required(),
    endDate: Joi.date().min(Joi.ref('effectiveDate')).optional(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const updateEmployeeBenefitValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    effectiveDate: Joi.date().max('now').optional(),
    endDate: Joi.date().min(Joi.ref('effectiveDate')).optional(),
    notes: Joi.string().max(500).optional(),
    active: Joi.boolean().optional(),
  }),
};

export const createBonusValidation = {
  body: Joi.object({
    employeeId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
    type: Joi.string()
      .valid('PERFORMANCE', 'SIGNING', 'RETENTION', 'REFERRAL', 'HOLIDAY', 'OTHER')
      .required(),
    reason: Joi.string().min(10).max(500).required(),
    effectiveDate: Joi.date().max('now').required(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const updateBonusValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    amount: Joi.number().positive().optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP').optional(),
    type: Joi.string()
      .valid('PERFORMANCE', 'SIGNING', 'RETENTION', 'REFERRAL', 'HOLIDAY', 'OTHER')
      .optional(),
    reason: Joi.string().min(10).max(500).optional(),
    effectiveDate: Joi.date().max('now').optional(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const getBonusByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const searchBonusesValidation = {
  query: Joi.object({
    employeeId: Joi.string().uuid().optional(),
    departmentId: Joi.string().uuid().optional(),
    type: Joi.string()
      .valid('PERFORMANCE', 'SIGNING', 'RETENTION', 'REFERRAL', 'HOLIDAY', 'OTHER')
      .optional(),
    effectiveDateFrom: Joi.date().optional(),
    effectiveDateTo: Joi.date().min(Joi.ref('effectiveDateFrom')).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};
