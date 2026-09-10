import { Request, Response } from 'express';
import { OnboardingService } from '../services/onboardingService';

export class OnboardingController {
  private onboardingService = new OnboardingService();
  /**
   * Create onboarding process
   */
  async createOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const onboardingData = req.body;
      const onboarding = await this.onboardingService.createOnboarding(onboardingData);

      res.status(201).json({
        success: true,
        data: onboarding,
        message: 'Onboarding process created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create onboarding process',
        error: error.message,
      });
    }
  }

  /**
   * Update onboarding status
   */
  async updateOnboardingStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, phase } = req.body;

      const updatedOnboarding = await this.onboardingService.updateOnboardingStatus(
        id,
        status,
        phase,
      );

      res.json({
        success: true,
        data: updatedOnboarding,
        message: 'Onboarding status updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update onboarding status',
        error: error.message,
      });
    }
  }

  /**
   * Advance onboarding phase
   */
  async advanceOnboardingPhase(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const advancedOnboarding = await this.onboardingService.advanceOnboardingPhase(id);

      res.json({
        success: true,
        data: advancedOnboarding,
        message: 'Onboarding phase advanced successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to advance onboarding phase',
        error: error.message,
      });
    }
  }

  /**
   * Search onboardings
   */
  async searchOnboardings(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        phase,
        assignedTo,
        startDateFrom,
        startDateTo,
        searchTerm,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        status: status as any,
        phase: phase as any,
        assignedTo: assignedTo as string,
        startDateFrom: startDateFrom ? new Date(startDateFrom as string) : undefined,
        startDateTo: startDateTo ? new Date(startDateTo as string) : undefined,
        searchTerm: searchTerm as string,
      };

      const result = await this.onboardingService.searchOnboardings(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
        message: 'Onboardings retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to search onboardings',
        error: error.message,
      });
    }
  }

  /**
   * Create onboarding task
   */
  async createOnboardingTask(req: Request, res: Response): Promise<void> {
    try {
      const taskData = req.body;
      const task = await this.onboardingService.createOnboardingTask(taskData);

      res.status(201).json({
        success: true,
        data: task,
        message: 'Onboarding task created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create onboarding task',
        error: error.message,
      });
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, completionNotes } = req.body;

      const updatedTask = await this.onboardingService.updateTaskStatus(
        id,
        status,
        completionNotes,
      );

      res.json({
        success: true,
        data: updatedTask,
        message: 'Task status updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update task status',
        error: error.message,
      });
    }
  }

  /**
   * Search tasks
   */
  async searchTasks(req: Request, res: Response): Promise<void> {
    try {
      const {
        onboardingId,
        status,
        priority,
        category,
        assignedTo,
        dueDateFrom,
        dueDateTo,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        onboardingId: onboardingId as string,
        status: status as any,
        priority: priority as any,
        category: category as any,
        assignedTo: assignedTo as string,
        dueDateFrom: dueDateFrom ? new Date(dueDateFrom as string) : undefined,
        dueDateTo: dueDateTo ? new Date(dueDateTo as string) : undefined,
      };

      const result = await this.onboardingService.searchTasks(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
        message: 'Tasks retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to search tasks',
        error: error.message,
      });
    }
  }

  /**
   * Get onboarding progress
   */
  async getOnboardingProgress(req: Request, res: Response): Promise<void> {
    try {
      const onboardingId = req.params.onboardingId as string;
      const progress = await this.onboardingService.getOnboardingProgress(onboardingId);

      res.json({
        success: true,
        data: progress,
        message: 'Onboarding progress retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get onboarding progress',
        error: error.message,
      });
    }
  }

  /**
   * Create onboarding template
   */
  async createOnboardingTemplate(req: Request, res: Response): Promise<void> {
    try {
      const templateData = req.body;
      const template = await this.onboardingService.createOnboardingTemplate(templateData);

      res.status(201).json({
        success: true,
        data: template,
        message: 'Onboarding template created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create onboarding template',
        error: error.message,
      });
    }
  }

  /**
   * Clone onboarding from template
   */
  async cloneOnboardingFromTemplate(req: Request, res: Response): Promise<void> {
    try {
      const templateId = req.params.templateId as string;
      const { employeeId } = req.body;

      const newOnboarding = await this.onboardingService.cloneOnboardingFromTemplate(
        templateId,
        employeeId,
      );

      res.status(201).json({
        success: true,
        data: newOnboarding,
        message: 'Onboarding cloned from template successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to clone onboarding from template',
        error: error.message,
      });
    }
  }

  /**
   * Get onboarding analytics
   */
  async getOnboardingAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.onboardingService.getOnboardingAnalytics();

      res.json({
        success: true,
        data: analytics,
        message: 'Onboarding analytics retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get onboarding analytics',
        error: error.message,
      });
    }
  }

  /**
   * Update onboarding
   */
  async updateOnboarding(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // TODO: Implement update onboarding functionality
      const updatedOnboarding = { id, ...updateData };

      res.json({
        success: true,
        data: updatedOnboarding,
        message: 'Onboarding updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update onboarding',
        error: error.message,
      });
    }
  }

  /**
   * Get onboarding by ID
   */
  async getOnboardingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // TODO: Implement get onboarding by ID functionality
      const onboarding = { id, status: 'IN_PROGRESS' };

      if (!onboarding) {
        res.status(404).json({
          success: false,
          message: 'Onboarding not found',
        });
        return;
      }

      res.json({
        success: true,
        data: onboarding,
        message: 'Onboarding retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get onboarding',
        error: error.message,
      });
    }
  }

  /**
   * Update onboarding task
   */
  async updateOnboardingTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // TODO: Implement update onboarding task functionality
      const updatedTask = { id, ...updateData };

      res.json({
        success: true,
        data: updatedTask,
        message: 'Onboarding task updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update onboarding task',
        error: error.message,
      });
    }
  }

  /**
   * Get onboarding task by ID
   */
  async getOnboardingTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // TODO: Implement get onboarding task by ID functionality
      const task = { id, status: 'PENDING' };

      if (!task) {
        res.status(404).json({
          success: false,
          message: 'Onboarding task not found',
        });
        return;
      }

      res.json({
        success: true,
        data: task,
        message: 'Onboarding task retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get onboarding task',
        error: error.message,
      });
    }
  }
}
