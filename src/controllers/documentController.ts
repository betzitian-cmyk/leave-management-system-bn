import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService';

export class DocumentController {
  private documentService = new DocumentService();

  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const leaveRequestId = req.params.leaveRequestId as string;
      const userId = (req as any).user.id;
      const file = (req as any).file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const result = await this.documentService.uploadDocument(file, leaveRequestId, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to upload document',
          error: result.error,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: result.data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: error.message,
      });
    }
  }

  async getDocumentById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await this.documentService.getDocument(id);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: 'Document not found',
          error: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get document',
        error: error.message,
      });
    }
  }

  async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;

      const result = await this.documentService.deleteDocument(id, userId);

      if (!result.success) {
        const statusCode = result.error?.includes('not found')
          ? 404
          : result.error?.includes('Unauthorized')
            ? 403
            : 400;
        res.status(statusCode).json({
          success: false,
          message: 'Failed to delete document',
          error: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete document',
        error: error.message,
      });
    }
  }

  async getDocumentsByLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const leaveRequestId = req.params.leaveRequestId as string;
      const result = await this.documentService.getDocumentsByLeaveRequest(leaveRequestId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to get documents',
          error: result.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get documents',
        error: error.message,
      });
    }
  }
}
