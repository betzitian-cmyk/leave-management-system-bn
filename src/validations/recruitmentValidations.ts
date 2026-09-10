import Joi from 'joi';

export const createJobPostingValidation = {
  body: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(50).max(2000).required(),
    requirements: Joi.array().items(Joi.string().min(5).max(200)).min(1).required(),
    responsibilities: Joi.array().items(Joi.string().min(5).max(200)).min(1).required(),
    departmentId: Joi.string().uuid().required(),
    location: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP').required(),
    experienceLevel: Joi.string().valid('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD').required(),
    salaryRange: Joi.object({
      min: Joi.number().positive().required(),
      max: Joi.number().positive().min(Joi.ref('min')).required(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
    }).optional(),
    benefits: Joi.array().items(Joi.string().min(5).max(100)).optional(),
    applicationDeadline: Joi.date().min('now').required(),
  }),
};

export const updateJobPostingValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().min(50).max(2000).optional(),
    requirements: Joi.array().items(Joi.string().min(5).max(200)).min(1).optional(),
    responsibilities: Joi.array().items(Joi.string().min(5).max(200)).min(1).optional(),
    departmentId: Joi.string().uuid().optional(),
    location: Joi.string().min(2).max(100).optional(),
    type: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP').optional(),
    experienceLevel: Joi.string().valid('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD').optional(),
    salaryRange: Joi.object({
      min: Joi.number().positive().required(),
      max: Joi.number().positive().min(Joi.ref('min')).required(),
      currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
    }).optional(),
    benefits: Joi.array().items(Joi.string().min(5).max(100)).optional(),
    applicationDeadline: Joi.date().min('now').optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED').optional(),
  }),
};

export const publishJobPostingValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    approvedBy: Joi.string().uuid().required(),
  }),
};

export const getJobPostingByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const searchJobPostingsValidation = {
  query: Joi.object({
    departmentId: Joi.string().uuid().optional(),
    location: Joi.string().min(2).max(100).optional(),
    type: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP').optional(),
    experienceLevel: Joi.string().valid('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD').optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED').optional(),
    searchTerm: Joi.string().min(2).max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const createJobApplicationValidation = {
  body: Joi.object({
    jobPostingId: Joi.string().uuid().required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .min(10)
      .max(20)
      .required(),
    resume: Joi.string().uri().required(),
    coverLetter: Joi.string().min(100).max(1000).optional(),
    experience: Joi.number().integer().min(0).max(50).required(),
    expectedSalary: Joi.number().positive().optional(),
    availability: Joi.date().min('now').optional(),
  }),
};

export const updateJobApplicationValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    status: Joi.string()
      .valid('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED')
      .required(),
    notes: Joi.string().max(500).optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
  }),
};

export const getJobApplicationByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const searchJobApplicationsValidation = {
  query: Joi.object({
    jobPostingId: Joi.string().uuid().optional(),
    status: Joi.string()
      .valid('PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED')
      .optional(),
    experience: Joi.number().integer().min(0).max(50).optional(),
    searchTerm: Joi.string().min(2).max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const createInterviewValidation = {
  body: Joi.object({
    jobApplicationId: Joi.string().uuid().required(),
    interviewerId: Joi.string().uuid().required(),
    scheduledDate: Joi.date().min('now').required(),
    duration: Joi.number().integer().min(15).max(480).required(), // minutes
    type: Joi.string().valid('PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'BEHAVIORAL').required(),
    location: Joi.string().min(2).max(200).optional(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const updateInterviewValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    scheduledDate: Joi.date().min('now').optional(),
    duration: Joi.number().integer().min(15).max(480).optional(),
    type: Joi.string().valid('PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'BEHAVIORAL').optional(),
    location: Joi.string().min(2).max(200).optional(),
    notes: Joi.string().max(500).optional(),
    status: Joi.string().valid('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED').optional(),
  }),
};

export const getInterviewByIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

export const searchInterviewsValidation = {
  query: Joi.object({
    jobApplicationId: Joi.string().uuid().optional(),
    interviewerId: Joi.string().uuid().optional(),
    status: Joi.string().valid('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED').optional(),
    type: Joi.string().valid('PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'BEHAVIORAL').optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().min(Joi.ref('dateFrom')).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};
