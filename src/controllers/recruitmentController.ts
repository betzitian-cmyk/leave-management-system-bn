import { Request, Response } from 'express';
import { RecruitmentService } from '../services/recruitmentService';

export class RecruitmentController {
  private recruitmentService = new RecruitmentService();
  /**
   * Create job posting
   */
  async createJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const jobData = req.body;
      const jobPosting = await this.recruitmentService.createJobPosting(jobData);

      res.status(201).json({
        success: true,
        data: jobPosting,
        message: 'Job posting created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create job posting',
        error: error.message,
      });
    }
  }

  /**
   * Update job posting
   */
  async updateJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updates = req.body;

      const oldJobPosting = await this.recruitmentService.searchJobPostings({}, 1, 1);
      const updatedJobPosting = await this.recruitmentService.updateJobPosting(id, updates);

      res.json({
        success: true,
        data: updatedJobPosting,
        message: 'Job posting updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update job posting',
        error: error.message,
      });
    }
  }

  /**
   * Publish job posting
   */
  async publishJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { approvedBy } = req.body;

      const publishedJobPosting = await this.recruitmentService.publishJobPosting(id, approvedBy);

      res.json({
        success: true,
        data: publishedJobPosting,
        message: 'Job posting published successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to publish job posting',
        error: error.message,
      });
    }
  }

  /**
   * Close job posting
   */
  async closeJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const closedJobPosting = await this.recruitmentService.closeJobPosting(id);

      res.json({
        success: true,
        data: closedJobPosting,
        message: 'Job posting closed successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to close job posting',
        error: error.message,
      });
    }
  }

  /**
   * Search job postings
   */
  async searchJobPostings(req: Request, res: Response): Promise<void> {
    try {
      const {
        departmentId,
        status,
        employmentType,
        location,
        remoteWork,
        searchTerm,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        departmentId: departmentId as string,
        status: status as any,
        employmentType: employmentType as string,
        location: location as string,
        remoteWork: remoteWork === 'true',
        searchTerm: searchTerm as string,
      };

      const result = await this.recruitmentService.searchJobPostings(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
        message: 'Job postings retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to search job postings',
        error: error.message,
      });
    }
  }

  /**
   * Submit job application
   */
  async submitApplication(req: Request, res: Response): Promise<void> {
    try {
      const applicationData = req.body;
      const application = await this.recruitmentService.submitApplication(applicationData);

      res.status(201).json({
        success: true,
        data: application,
        message: 'Job application submitted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to submit job application',
        error: error.message,
      });
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, notes } = req.body;

      const updatedApplication = await this.recruitmentService.updateApplicationStatus(
        id,
        status,
        notes,
      );

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Application status updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update application status',
        error: error.message,
      });
    }
  }

  /**
   * Search applications
   */
  async searchApplications(req: Request, res: Response): Promise<void> {
    try {
      const { jobPostingId, status, departmentId, searchTerm, page = 1, limit = 20 } = req.query;

      const filters = {
        jobPostingId: jobPostingId as string,
        status: status as any,
        departmentId: departmentId as string,
        searchTerm: searchTerm as string,
      };

      const result = await this.recruitmentService.searchApplications(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
        message: 'Applications retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to search applications',
        error: error.message,
      });
    }
  }

  /**
   * Schedule interview
   */
  async scheduleInterview(req: Request, res: Response): Promise<void> {
    try {
      const interviewData = req.body;
      const interview = await this.recruitmentService.scheduleInterview(interviewData);

      res.status(201).json({
        success: true,
        data: interview,
        message: 'Interview scheduled successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to schedule interview',
        error: error.message,
      });
    }
  }

  /**
   * Update interview status
   */
  async updateInterviewStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, result } = req.body;

      const updatedInterview = await this.recruitmentService.updateInterviewStatus(
        id,
        status,
        result,
      );

      res.json({
        success: true,
        data: updatedInterview,
        message: 'Interview status updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update interview status',
        error: error.message,
      });
    }
  }

  /**
   * Search interviews
   */
  async searchInterviews(req: Request, res: Response): Promise<void> {
    try {
      const {
        applicationId,
        status,
        type,
        interviewerId,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        applicationId: applicationId as string,
        status: status as any,
        type: type as any,
        interviewerId: interviewerId as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const result = await this.recruitmentService.searchInterviews(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
        message: 'Interviews retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to search interviews',
        error: error.message,
      });
    }
  }

  /**
   * Get recruitment analytics
   */
  async getRecruitmentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.recruitmentService.getRecruitmentAnalytics();

      res.json({
        success: true,
        data: analytics,
        message: 'Recruitment analytics retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get recruitment analytics',
        error: error.message,
      });
    }
  }

  /**
   * Get job posting by ID
   */
  async getJobPostingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // TODO: Implement get job posting by ID functionality
      const jobPosting = { id, title: 'Sample Job', status: 'ACTIVE' };

      if (!jobPosting) {
        res.status(404).json({
          success: false,
          message: 'Job posting not found',
        });
        return;
      }

      res.json({
        success: true,
        data: jobPosting,
        message: 'Job posting retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get job posting',
        error: error.message,
      });
    }
  }

  /**
   * Create job application
   */
  async createJobApplication(req: Request, res: Response): Promise<void> {
    try {
      const applicationData = req.body;
      const application = await this.recruitmentService.submitApplication(applicationData);

      res.status(201).json({
        success: true,
        data: application,
        message: 'Job application created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create job application',
        error: error.message,
      });
    }
  }

  /**
   * Update job application
   */
  async updateJobApplication(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updates = req.body;

      const updatedApplication = await this.recruitmentService.updateApplicationStatus(
        id,
        updates.status,
        updates.notes,
      );

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Job application updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update job application',
        error: error.message,
      });
    }
  }

  /**
   * Get job application by ID
   */
  async getJobApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // TODO: Implement get application by ID functionality
      const application = { id, status: 'PENDING' };

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Job application not found',
        });
        return;
      }

      res.json({
        success: true,
        data: application,
        message: 'Job application retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get job application',
        error: error.message,
      });
    }
  }

  /**
   * Create interview
   */
  async createInterview(req: Request, res: Response): Promise<void> {
    try {
      const interviewData = req.body;
      const interview = await this.recruitmentService.scheduleInterview(interviewData);

      res.status(201).json({
        success: true,
        data: interview,
        message: 'Interview created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create interview',
        error: error.message,
      });
    }
  }

  /**
   * Update interview
   */
  async updateInterview(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updates = req.body;

      const updatedInterview = await this.recruitmentService.updateInterviewStatus(
        id,
        updates.status,
        updates.notes,
      );

      res.json({
        success: true,
        data: updatedInterview,
        message: 'Interview updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update interview',
        error: error.message,
      });
    }
  }

  /**
   * Get interview by ID
   */
  async getInterviewById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // TODO: Implement get interview by ID functionality
      const interview = { id, status: 'SCHEDULED' };

      if (!interview) {
        res.status(404).json({
          success: false,
          message: 'Interview not found',
        });
        return;
      }

      res.json({
        success: true,
        data: interview,
        message: 'Interview retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get interview',
        error: error.message,
      });
    }
  }
}
