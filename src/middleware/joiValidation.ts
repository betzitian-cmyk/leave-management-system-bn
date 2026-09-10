import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    const validationErrors: any = {};

    // Validate body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        validationErrors.body = error.details.map((detail: any) => detail.message);
      } else {
        req.body = value;
      }
    }

    // Validate query
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        validationErrors.query = error.details.map((detail: any) => detail.message);
      } else {
        req.query = value;
      }
    }

    // Validate params
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        validationErrors.params = error.details.map((detail: any) => detail.message);
      } else {
        req.params = value;
      }
    }

    // If there are validation errors, send response and return early
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
      return;
    }

    next();
  };
};
