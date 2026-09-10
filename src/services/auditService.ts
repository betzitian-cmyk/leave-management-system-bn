import { getRepository } from 'typeorm';
import { AuditLog } from '../models';

// Simplified to only critical security events
export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'ROLE_CHANGE'
  | 'USER_STATUS_CHANGE'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'CRITICAL_UPDATE'
  | 'CREATE_ATTENDANCE'
  | 'CREATE_ATTENDANCE_FINGERPRINT'
  | 'UPDATE_ATTENDANCE'
  | 'ENROLL_FINGERPRINT'
  | 'UPDATE_FINGERPRINT'
  | 'REMOVE_FINGERPRINT';

export type EntityType = 'User' | 'LeaveRequest' | 'System' | 'Attendance' | 'Employee';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Log a critical security event
   */
  async logSecurityEvent(entry: AuditLogEntry): Promise<AuditLog> {
    try {
      const auditLogRepository = getRepository(AuditLog);

      const auditLog = auditLogRepository.create({
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        description: entry.description,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: new Date(),
      });

      const savedLog = await auditLogRepository.save(auditLog);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SECURITY] ${entry.action} on ${entry.entityType} by user ${entry.userId}`);
      }

      return savedLog;
    } catch (error) {
      console.error('Error logging security event:', error);
      // Don't throw error as audit logging should not break main functionality
      return null as any;
    }
  }

  /**
   * Log user authentication events
   */
  async logUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: 'LOGIN',
      entityType: 'User',
      entityId: userId,
      description: 'User logged in successfully',
      ipAddress,
      userAgent,
    });
  }

  async logUserLogout(userId: string, ipAddress?: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: userId,
      description: 'User logged out',
      ipAddress,
    });
  }

  async logFailedLogin(
    email: string,
    ipAddress?: string,
    userAgent?: string,
    reason?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      userId: 'SYSTEM',
      action: 'LOGIN_FAILED',
      entityType: 'User',
      description: `Failed login attempt for email: ${email}. Reason: ${reason || 'Invalid credentials'}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log critical security events
   */
  async logRoleChange(
    userId: string,
    targetUserId: string,
    oldRole: string,
    newRole: string,
    changedBy: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      userId: changedBy,
      action: 'ROLE_CHANGE',
      entityType: 'User',
      entityId: targetUserId,
      description: `Role changed from ${oldRole} to ${newRole} for user ${targetUserId} by ${changedBy}`,
    });
  }

  async logUserStatusChange(
    userId: string,
    oldStatus: string,
    newStatus: string,
    changedBy: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      userId: changedBy,
      action: 'USER_STATUS_CHANGE',
      entityType: 'User',
      entityId: userId,
      description: `User status changed from ${oldStatus} to ${newStatus} by ${changedBy}`,
    });
  }

  async logPasswordChange(userId: string, ipAddress?: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: 'PASSWORD_CHANGE',
      entityType: 'User',
      entityId: userId,
      description: 'Password changed',
      ipAddress,
    });
  }

  async logPasswordReset(userId: string, ipAddress?: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: 'PASSWORD_RESET',
      entityType: 'User',
      entityId: userId,
      description: 'Password reset',
      ipAddress,
    });
  }

  /**
   * Log leave approval/rejection for accountability
   */
  async logLeaveApproval(
    leaveRequestId: string,
    approverId: string,
    action: 'APPROVED' | 'REJECTED',
    comments?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      userId: approverId,
      action: action === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      entityType: 'LeaveRequest',
      entityId: leaveRequestId,
      description: `Leave request ${action.toLowerCase()} by ${approverId}${comments ? `: ${comments}` : ''}`,
    });
  }

  /**
   * Get recent security events (Admin/HR only)
   */
  async getRecentSecurityEvents(limit: number = 100): Promise<AuditLog[]> {
    try {
      const auditLogRepository = getRepository(AuditLog);
      return await auditLogRepository.find({
        order: { timestamp: 'DESC' },
        take: limit,
      });
    } catch (error) {
      console.error('Error getting recent security events:', error);
      return [];
    }
  }

  /**
   * Clean up old audit logs (keep last 90 days)
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    try {
      const auditLogRepository = getRepository(AuditLog);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await auditLogRepository
        .createQueryBuilder()
        .delete()
        .from(AuditLog)
        .where('timestamp < :cutoffDate', { cutoffDate })
        .execute();

      return result.affected || 0;
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
      return 0;
    }
  }
}
