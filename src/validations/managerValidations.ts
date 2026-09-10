import Joi from 'joi';

export const getTeamMembersValidation = {
  query: Joi.object({
    includeInactive: Joi.boolean().default(false),
  }),
};

export const getTeamLeavesValidation = {
  query: Joi.object({
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED').optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().min(Joi.ref('dateFrom')).optional(),
  }),
};

export const getTeamPerformanceValidation = {
  query: Joi.object({
    year: Joi.number().integer().min(2020).max(2030).default(new Date().getFullYear()),
    month: Joi.number().integer().min(1).max(12).optional(),
  }),
};
