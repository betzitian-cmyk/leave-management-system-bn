import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  private notificationService = new NotificationService();
  /**
   * Get user notifications
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const result = await this.notificationService.getUserNotifications(
        userId,
        page,
        limit,
        unreadOnly,
      );

      res.json({
        success: true,
        data: result.notifications,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        message: 'Notifications retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
        error: error.message,
      });
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;

      await this.notificationService.markNotificationAsRead(id, userId);

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message,
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      await this.notificationService.markAllNotificationsAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message,
      });
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;

      await this.notificationService.deleteNotification(id, userId);

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message,
      });
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const preferences = await this.notificationService.getNotificationPreferences(userId);

      res.json({
        success: true,
        data: preferences,
        message: 'Notification preferences retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification preferences',
        error: error.message,
      });
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const preferences = req.body;

      const updatedPreferences = await this.notificationService.updateNotificationPreferences(
        userId,
        preferences,
      );

      res.json({
        success: true,
        data: updatedPreferences,
        message: 'Notification preferences updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        error: error.message,
      });
    }
  }
}
