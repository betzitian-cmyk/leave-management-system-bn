import Joi from 'joi';

export const notificationIdValidation = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Notification ID must be a valid UUID',
      'any.required': 'Notification ID is required',
    }),
  }),
};

export const getUserNotificationsValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(20).optional(),
    unreadOnly: Joi.boolean().default(false).optional(),
  }),
};

export const updateNotificationPreferencesValidation = {
  body: Joi.object({
    emailNotifications: Joi.boolean().optional(),
    smsNotifications: Joi.boolean().optional(),
    pushNotifications: Joi.boolean().optional(),
    leaveApprovalNotifications: Joi.boolean().optional(),
    leaveReminderNotifications: Joi.boolean().optional(),
  }),
};
