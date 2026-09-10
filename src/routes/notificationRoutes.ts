import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/joiValidation';
import {
  notificationIdValidation,
  getUserNotificationsValidation,
  updateNotificationPreferencesValidation,
} from '../validations/notificationValidations';

const router = Router();
const notificationController = new NotificationController();

// All notification routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get(
  '/my-notifications',
  validateRequest(getUserNotificationsValidation),
  notificationController.getUserNotifications.bind(notificationController),
);

// Mark notification as read
router.put(
  '/:id/read',
  validateRequest(notificationIdValidation),
  notificationController.markNotificationAsRead.bind(notificationController),
);

// Mark all notifications as read
router.put(
  '/mark-all-read',
  notificationController.markAllNotificationsAsRead.bind(notificationController),
);

// Delete notification
router.delete(
  '/:id',
  validateRequest(notificationIdValidation),
  notificationController.deleteNotification.bind(notificationController),
);

// Get notification preferences
router.get(
  '/preferences',
  notificationController.getNotificationPreferences.bind(notificationController),
);

// Update notification preferences
router.put(
  '/preferences',
  validateRequest(updateNotificationPreferencesValidation),
  notificationController.updateNotificationPreferences.bind(notificationController),
);

export default router;
