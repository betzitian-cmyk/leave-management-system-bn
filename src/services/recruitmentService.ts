import { getRepository } from 'typeorm';
import {
  JobPosting,
  JobApplication,
  Interview,
  Department,
  JobStatus,
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
  InterviewResult,
} from '../models';

export interface JobPostingFilters {
  departmentId?: string;
  status?: JobStatus;
  employmentType?: string;
  location?: string;
  remoteWork?: boolean;
  searchTerm?: string;
}

export interface ApplicationFilters {
  jobPostingId?: string;
  status?: ApplicationStatus;
  departmentId?: string;
  searchTerm?: string;
}

export interface InterviewFilters {
  applicationId?: string;
  status?: InterviewStatus;
  type?: InterviewType;
  interviewerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class RecruitmentService {
  /**
   * Create a new job posting
   */
  async createJobPosting(jobData: Partial<JobPosting>): Promise<JobPosting> {
    try {
      const jobPostingRepository = getRepository(JobPosting);
      const jobPosting = jobPostingRepository.create(jobData);
      return await jobPostingRepository.save(jobPosting);
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw error;
    }
  }

  /**
   * Update job posting
   */
  async updateJobPosting(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
    try {
      const jobPostingRepository = getRepository(JobPosting);
      const jobPosting = await jobPostingRepository.findOne({ where: { id } });

      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      Object.assign(jobPosting, updates);
      return await jobPostingRepository.save(jobPosting);
    } catch (error) {
      console.error('Error updating job posting:', error);
      throw error;
    }
  }

  /**
   * Publish job posting
   */
  async publishJobPosting(id: string, approvedBy: string): Promise<JobPosting> {
    try {
      const jobPostingRepository = getRepository(JobPosting);
      const jobPosting = await jobPostingRepository.findOne({ where: { id } });

      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      jobPosting.status = JobStatus.PUBLISHED;
      jobPosting.approvedById = approvedBy;
      jobPosting.publishedAt = new Date();

      return await jobPostingRepository.save(jobPosting);
    } catch (error) {
      console.error('Error publishing job posting:', error);
      throw error;
    }
  }

  /**
   * Close job posting
   */
  async closeJobPosting(id: string): Promise<JobPosting> {
    try {
      const jobPostingRepository = getRepository(JobPosting);
      const jobPosting = await jobPostingRepository.findOne({ where: { id } });

      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      jobPosting.status = JobStatus.CLOSED;
      jobPosting.closedAt = new Date();

      return await jobPostingRepository.save(jobPosting);
    } catch (error) {
      console.error('Error closing job posting:', error);
      throw error;
    }
  }

  /**
   * Search job postings
   */
  async searchJobPostings(
    filters: JobPostingFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ jobPostings: JobPosting[]; total: number; page: number; totalPages: number }> {
    try {
      const jobPostingRepository = getRepository(JobPosting);
      let query = jobPostingRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.department', 'dept');

      // Apply filters
      if (filters.departmentId) {
        query = query.andWhere('job.departmentId = :departmentId', {
          departmentId: filters.departmentId,
        });
      }

      if (filters.status) {
        query = query.andWhere('job.status = :status', { status: filters.status });
      }

      if (filters.employmentType) {
        query = query.andWhere('job.employmentType = :employmentType', {
          employmentType: filters.employmentType,
        });
      }

      if (filters.location) {
        query = query.andWhere('job.location ILIKE :location', {
          location: `%${filters.location}%`,
        });
      }

      if (filters.remoteWork !== undefined) {
        query = query.andWhere('job.remoteWork = :remoteWork', { remoteWork: filters.remoteWork });
      }

      if (filters.searchTerm) {
        query = query.andWhere(
          '(job.title ILIKE :searchTerm OR job.description ILIKE :searchTerm)',
          { searchTerm: `%${filters.searchTerm}%` },
        );
      }

      // Get total count
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by creation date
      query = query.orderBy('job.createdAt', 'DESC');

      const jobPostings = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      return {
        jobPostings,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching job postings:', error);
      throw error;
    }
  }

  /**
   * Submit job application
   */
  async submitApplication(applicationData: Partial<JobApplication>): Promise<JobApplication> {
    try {
      const applicationRepository = getRepository(JobApplication);
      const application = applicationRepository.create(applicationData);
      return await applicationRepository.save(application);
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string,
  ): Promise<JobApplication> {
    try {
      const applicationRepository = getRepository(JobApplication);
      const application = await applicationRepository.findOne({
        where: { id },
        relations: ['jobPosting', 'assignedTo', 'reviewedBy'],
      });

      if (!application) {
        throw new Error('Application not found');
      }

      application.status = status;
      if (notes) {
        application.notes = notes;
      }
      application.reviewedAt = new Date();

      return await applicationRepository.save(application);
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Search applications
   */
  async searchApplications(
    filters: ApplicationFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ applications: JobApplication[]; total: number; page: number; totalPages: number }> {
    try {
      const applicationRepository = getRepository(JobApplication);
      let query = applicationRepository
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.jobPosting', 'job')
        .leftJoinAndSelect('job.department', 'dept');

      // Apply filters
      if (filters.jobPostingId) {
        query = query.andWhere('app.jobPostingId = :jobPostingId', {
          jobPostingId: filters.jobPostingId,
        });
      }

      if (filters.status) {
        query = query.andWhere('app.status = :status', { status: filters.status });
      }

      if (filters.departmentId) {
        query = query.andWhere('job.departmentId = :departmentId', {
          departmentId: filters.departmentId,
        });
      }

      if (filters.searchTerm) {
        query = query.andWhere(
          '(app.firstName ILIKE :searchTerm OR app.lastName ILIKE :searchTerm OR app.email ILIKE :searchTerm)',
          { searchTerm: `%${filters.searchTerm}%` },
        );
      }

      // Get total count
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by application date
      query = query.orderBy('app.createdAt', 'DESC');

      const applications = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      return {
        applications,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching applications:', error);
      throw error;
    }
  }

  /**
   * Schedule interview
   */
  async scheduleInterview(interviewData: Partial<Interview>): Promise<Interview> {
    try {
      const interviewRepository = getRepository(Interview);
      const interview = interviewRepository.create(interviewData);
      return await interviewRepository.save(interview);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }
  }

  /**
   * Update interview status
   */
  async updateInterviewStatus(
    id: string,
    status: InterviewStatus,
    result?: InterviewResult,
  ): Promise<Interview> {
    try {
      const interviewRepository = getRepository(Interview);
      const interview = await interviewRepository.findOne({ where: { id } });

      if (!interview) {
        throw new Error('Interview not found');
      }

      interview.status = status;

      if (status === InterviewStatus.COMPLETED) {
        interview.completedAt = new Date();
      }

      if (result) {
        interview.result = result;
      }

      return await interviewRepository.save(interview);
    } catch (error) {
      console.error('Error updating interview status:', error);
      throw error;
    }
  }

  /**
   * Search interviews
   */
  async searchInterviews(
    filters: InterviewFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ interviews: Interview[]; total: number; page: number; totalPages: number }> {
    try {
      const interviewRepository = getRepository(Interview);
      let query = interviewRepository
        .createQueryBuilder('interview')
        .leftJoinAndSelect('interview.application', 'app')
        .leftJoinAndSelect('app.jobPosting', 'job');

      // Apply filters
      if (filters.applicationId) {
        query = query.andWhere('interview.applicationId = :applicationId', {
          applicationId: filters.applicationId,
        });
      }

      if (filters.status) {
        query = query.andWhere('interview.status = :status', { status: filters.status });
      }

      if (filters.type) {
        query = query.andWhere('interview.type = :type', { type: filters.type });
      }

      if (filters.interviewerId) {
        query = query.andWhere(':interviewerId = ANY(interview.interviewers)', {
          interviewerId: filters.interviewerId,
        });
      }

      if (filters.dateFrom) {
        query = query.andWhere('interview.scheduledAt >= :dateFrom', {
          dateFrom: filters.dateFrom,
        });
      }

      if (filters.dateTo) {
        query = query.andWhere('interview.scheduledAt <= :dateTo', { dateTo: filters.dateTo });
      }

      // Get total count
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by scheduled date
      query = query.orderBy('interview.scheduledAt', 'ASC');

      const interviews = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      return {
        interviews,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching interviews:', error);
      throw error;
    }
  }

  /**
   * Get recruitment analytics
   */
  async getRecruitmentAnalytics(): Promise<{
    totalJobPostings: number;
    activeJobPostings: number;
    totalApplications: number;
    applicationsThisMonth: number;
    interviewsScheduled: number;
    interviewsCompleted: number;
    offersExtended: number;
    offersAccepted: number;
    timeToHire: number;
    costPerHire: number;
  }> {
    try {
      const jobPostingRepository = getRepository(JobPosting);
      const applicationRepository = getRepository(JobApplication);
      const interviewRepository = getRepository(Interview);

      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const [
        totalJobPostings,
        activeJobPostings,
        totalApplications,
        applicationsThisMonth,
        interviewsScheduled,
        interviewsCompleted,
        offersExtended,
        offersAccepted,
      ] = await Promise.all([
        jobPostingRepository.count(),
        jobPostingRepository.count({ where: { status: JobStatus.PUBLISHED } }),
        applicationRepository.count(),
        applicationRepository
          .createQueryBuilder('app')
          .where('app.createdAt >= :startOfMonth', { startOfMonth })
          .getCount(),
        interviewRepository.count({ where: { status: InterviewStatus.SCHEDULED } }),
        interviewRepository.count({ where: { status: InterviewStatus.COMPLETED } }),
        applicationRepository.count({ where: { status: ApplicationStatus.OFFER_EXTENDED } }),
        applicationRepository.count({ where: { status: ApplicationStatus.OFFER_ACCEPTED } }),
      ]);

      // Calculate average time to hire (placeholder - will implement actual calculation)
      const timeToHire = 30; // days
      const costPerHire = 5000; // dollars

      return {
        totalJobPostings,
        activeJobPostings,
        totalApplications,
        applicationsThisMonth,
        interviewsScheduled,
        interviewsCompleted,
        offersExtended,
        offersAccepted,
        timeToHire,
        costPerHire,
      };
    } catch (error) {
      console.error('Error getting recruitment analytics:', error);
      throw error;
    }
  }
}
