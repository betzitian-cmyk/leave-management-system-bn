// filepath: src/services/notificationService.ts
import { getRepository } from 'typeorm';
import { Notification, Employee, LeaveRequest } from '../models';
import nodemailer from 'nodemailer';
import { getSocketService } from '../config/socketio';
import dotenv from 'dotenv';
dotenv.config();

// Define valid notification types based on your model
type NotificationType =
  | 'LEAVE_SUBMITTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'LEAVE_REMINDER'
  | 'APPROVAL_PENDING'
  | 'LEAVE_CANCELLED';

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transport
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Get user notifications with pagination
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<{ notifications: Notification[]; total: number; totalPages: number }> {
    try {
      const notificationRepository = getRepository(Notification);

      let query = notificationRepository
        .createQueryBuilder('notification')
        .where('notification.recipientId = :userId', { userId });

      if (unreadOnly) {
        query = query.andWhere('notification.read = :read', { read: false });
      }

      const total = await query.getCount();
      const totalPages = Math.ceil(total / limit);

      const notifications = await query
        .orderBy('notification.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return { notifications, total, totalPages };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const notificationRepository = getRepository(Notification);

      const notification = await notificationRepository.findOne({
        where: { id: notificationId, recipientId: userId },
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      notification.read = true;
      await notificationRepository.save(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const notificationRepository = getRepository(Notification);

      await notificationRepository.update({ recipientId: userId, read: false }, { read: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      const notificationRepository = getRepository(Notification);

      const notification = await notificationRepository.findOne({
        where: { id: notificationId, recipientId: userId },
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      await notificationRepository.remove(notification);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notification preferences (simplified - just return default preferences)
  async getNotificationPreferences(userId: string): Promise<any> {
    try {
      // For now, return default preferences
      // In a real system, you might store these in a separate table
      return {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        leaveRequestNotifications: true,
        leaveStatusNotifications: true,
        reminderNotifications: true,
        systemNotifications: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId: string, preferences: any): Promise<any> {
    try {
      // For now, just return the updated preferences
      // In a real system, you might save these to a database
      const defaultPreferences = {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        leaveRequestNotifications: true,
        leaveStatusNotifications: true,
        reminderNotifications: true,
        systemNotifications: true,
      };

      return { ...defaultPreferences, ...preferences };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Notify about a new leave request (to admins and managers)
  async sendLeaveRequestCreatedNotification(leaveRequestId: string): Promise<void> {
    try {
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
        relations: ['employee', 'employee.user', 'leaveType'],
      });

      if (!leaveRequest || !leaveRequest.employee) {
        throw new Error('Leave request or employee not found');
      }

      const employee = leaveRequest.employee;

      // Get managers (assuming position field indicates manager role)
      const employeeRepository = getRepository(Employee);
      const managersAndAdmins = await employeeRepository.find({
        where: [{ position: 'MANAGER' }, { position: 'ADMIN' }],
      });

      // Create notifications in database for each manager and admin
      const notificationRepository = getRepository(Notification);

      for (const recipient of managersAndAdmins) {
        if (recipient.id !== employee.id) {
          // Don't notify the requester
          // Create notification entity with proper structure
          const notification = notificationRepository.create({
            recipientId: recipient.id, // Use recipientId instead of recipient
            title: 'New Leave Request',
            message: `${employee.user.firstName} ${employee.user.lastName} has requested leave.`,
            relatedEntityId: leaveRequestId,
            entityType: 'LEAVE_REQUEST',
            type: 'LEAVE_SUBMITTED',
            read: false,
          });

          await notificationRepository.save(notification);

          // Send email notification
          if (recipient.user?.email) {
            try {
              await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'aimegetz@gmail.com',
                to: recipient.user.email,
                subject: 'New Leave Request',
                text: `${employee.user.firstName} ${employee.user.lastName} has submitted a leave request that requires review.`,
                html: `<p>${employee.user.firstName} ${employee.user.lastName} has submitted a leave request that requires review.</p>
                      <p>Please log in to the Leave Management System to review this request.</p>`,
              });
            } catch (emailError) {
              console.error('Failed to send email notification:', emailError);
            }
          }
        }
      }

      // Send real-time notification via Socket.IO
      try {
        const socketService = getSocketService();
        await socketService.notifyAboutLeaveRequest(leaveRequestId, 'created');
      } catch (socketError) {
        console.error('Failed to send socket notification:', socketError);
      }
    } catch (error) {
      console.error('Failed to send leave request notification:', error);
    }
  }

  // Notify employee about leave request status update
  async sendLeaveStatusUpdateNotification(
    leaveRequestId: string,
    approved: boolean,
  ): Promise<void> {
    try {
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
        relations: ['employee', 'employee.user', 'leaveType'],
      });

      if (!leaveRequest || !leaveRequest.employee) {
        throw new Error('Leave request or employee not found');
      }

      const employee = leaveRequest.employee;
      const status = approved ? 'approved' : 'rejected';

      // Create notification in database
      const notificationRepository = getRepository(Notification);
      const notificationType: NotificationType = approved ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED';

      const notification = notificationRepository.create({
        recipientId: employee.id, // Use recipientId instead of recipient
        title: `Leave Request ${approved ? 'Approved' : 'Rejected'}`,
        message: `Your leave request has been ${status}.`,
        relatedEntityId: leaveRequestId,
        entityType: 'LEAVE_REQUEST',
        type: notificationType,
        read: false,
      });

      await notificationRepository.save(notification);

      // Send email to employee
      if (employee.user?.email) {
        try {
          await this.transporter.sendMail({
            from: process.env.EMAIL_FROM || 'aimegetz@gmail.com',
            to: employee.user.email,
            subject: `Leave Request ${approved ? 'Approved' : 'Rejected'}`,
            text: `Your leave request has been ${status}.`,
            html: `<p>Your leave request has been ${status}.</p>
                  <p>Please log in to the Leave Management System for more details.</p>`,
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }

      // Send real-time notification via Socket.IO
      try {
        const socketService = getSocketService();
        await socketService.notifyAboutLeaveRequest(
          leaveRequestId,
          approved ? 'approved' : 'rejected',
        );
      } catch (socketError) {
        console.error('Failed to send socket notification:', socketError);
      }
    } catch (error) {
      console.error('Failed to send leave status update notification:', error);
    }
  }

  // Notify managers and admins about leave request cancellation
  async sendLeaveCancellationNotification(leaveRequestId: string): Promise<void> {
    try {
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
        relations: ['employee', 'employee.user', 'leaveType'],
      });

      if (!leaveRequest || !leaveRequest.employee) {
        throw new Error('Leave request or employee not found');
      }

      const employee = leaveRequest.employee;

      // Get managers and admins
      const employeeRepository = getRepository(Employee);
      const managersAndAdmins = await employeeRepository.find({
        where: [{ position: 'MANAGER' }, { position: 'ADMIN' }],
      });

      // Create notifications in database for each manager and admin
      const notificationRepository = getRepository(Notification);

      for (const recipient of managersAndAdmins) {
        if (recipient.id !== employee.id) {
          // Don't notify the requester
          // Create notification with proper structure
          const notification = notificationRepository.create({
            recipientId: recipient.id, // Use recipientId instead of recipient
            title: 'Leave Request Cancelled',
            message: `${employee.user.firstName} ${employee.user.lastName} has cancelled their leave request.`,
            relatedEntityId: leaveRequestId,
            entityType: 'LEAVE_REQUEST',
            type: 'LEAVE_CANCELLED',
            read: false,
          });

          await notificationRepository.save(notification);

          // Send email notification
          if (recipient.user?.email) {
            try {
              await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'aimegetz@gmail.com',
                to: recipient.user.email,
                subject: 'Leave Request Cancelled',
                text: `${employee.user.firstName} ${employee.user.lastName} has cancelled their leave request.`,
                html: `<p>${employee.user.firstName} ${employee.user.lastName} has cancelled their leave request.</p>
                      <p>Please log in to the Leave Management System for more details.</p>`,
              });
            } catch (emailError) {
              console.error('Failed to send email notification:', emailError);
            }
          }
        }
      }

      // Send real-time notification via Socket.IO
      try {
        const socketService = getSocketService();
        await socketService.notifyAboutLeaveRequest(leaveRequestId, 'canceled');
      } catch (socketError) {
        console.error('Failed to send socket notification:', socketError);
      }
    } catch (error) {
      console.error('Failed to send leave cancellation notification:', error);
    }
  }
}
