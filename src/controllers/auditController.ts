import { Request, Response } from 'express';
import { AuditService } from '../services/auditService';

export class AuditController {
  private auditService = new AuditService();
  /**
   * Get recent security events (Admin/HR only)
   */
  async getRecentSecurityEvents(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const events = await this.auditService.getRecentSecurityEvents(limit);

      res.status(200).json({
        success: true,
        data: events,
        count: events.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve security events',
      });
    }
  }

  /**
   * Clean up old audit logs (Admin only)
   */
  async cleanupOldLogs(req: Request, res: Response): Promise<void> {
    try {
      const retentionDays = parseInt(req.body.retentionDays) || 90;
      const deletedCount = await this.auditService.cleanupOldLogs(retentionDays);

      res.status(200).json({
        success: true,
        message: `Cleaned up ${deletedCount} old security logs`,
        deletedCount,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to clean up old logs',
      });
    }
  }
}
