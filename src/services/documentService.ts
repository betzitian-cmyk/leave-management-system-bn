import { getRepository } from 'typeorm';
import { Document, LeaveRequest } from '../models';
import { CloudinaryService } from './cloudinaryService';

export class DocumentService {
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.cloudinaryService = new CloudinaryService();
  }

  /**
   * Upload a document to Cloudinary and associate it with a leave request
   */
  async uploadDocument(
    file: Express.Multer.File,
    leaveRequestId: string,
    uploadedById: string,
  ): Promise<{ success: boolean; data?: Document; error?: string }> {
    try {
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveRequest = await leaveRequestRepository.findOne({
        where: { id: leaveRequestId },
      });

      if (!leaveRequest) {
        return { success: false, error: 'Leave request not found' };
      }

      // Upload file to Cloudinary
      const cloudinaryResult = await this.cloudinaryService.uploadDocument(file);

      // Create document record
      const documentRepository = getRepository(Document);
      const document = documentRepository.create({
        leaveRequestId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        cloudinaryUrl: cloudinaryResult.secure_url,
        uploadedById,
      });

      const savedDocument = await documentRepository.save(document);
      return { success: true, data: savedDocument };
    } catch (error) {
      return { success: false, error: `Failed to upload document: ${error.message}` };
    }
  }

  /**
   * Get a document by ID
   */
  async getDocument(id: string): Promise<{ success: boolean; data?: Document; error?: string }> {
    try {
      const documentRepository = getRepository(Document);
      const document = await documentRepository.findOne({
        where: { id },
        relations: ['leaveRequest'],
      });

      if (!document) {
        return { success: false, error: 'Document not found' };
      }

      return { success: true, data: document };
    } catch (error) {
      return { success: false, error: `Failed to get document: ${error.message}` };
    }
  }

  /**
   * Get all documents for a leave request
   */
  async getDocumentsByLeaveRequest(
    leaveRequestId: string,
  ): Promise<{ success: boolean; data?: Document[]; error?: string }> {
    try {
      const documentRepository = getRepository(Document);
      const documents = await documentRepository.find({
        where: { leaveRequestId },
        order: { createdAt: 'DESC' },
      });
      return { success: true, data: documents };
    } catch (error) {
      return { success: false, error: `Failed to get documents: ${error.message}` };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const documentRepository = getRepository(Document);
      const document = await documentRepository.findOne({
        where: { id },
        relations: ['leaveRequest', 'leaveRequest.employee'],
      });

      if (!document) {
        return { success: false, error: 'Document not found' };
      }

      // Check if user has permission to delete
      if (document.uploadedById !== userId && document.leaveRequest.employee.user.id !== userId) {
        return { success: false, error: 'Unauthorized to delete this document' };
      }

      // Delete from Cloudinary
      if (document.cloudinaryPublicId) {
        await this.cloudinaryService.deleteFile(document.cloudinaryPublicId);
      }

      // Delete from database
      await documentRepository.remove(document);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to delete document: ${error.message}` };
    }
  }
}
