import Joi from 'joi';

export const createDepartmentValidation = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    managerId: Joi.string().uuid().optional(),
  }),
};

export const updateDepartmentValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    managerId: Joi.string().uuid().optional(),
  }),
};

export const getDepartmentByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const deleteDepartmentValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};
