import { getRepository } from 'typeorm';
import {
  Onboarding,
  OnboardingTask,
  Employee,
  OnboardingStatus,
  OnboardingPhase,
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from '../models';

export interface OnboardingFilters {
  status?: OnboardingStatus;
  phase?: OnboardingPhase;
  assignedTo?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  searchTerm?: string;
}

export interface TaskFilters {
  onboardingId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assignedTo?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export class OnboardingService {
  /**
   * Create onboarding process for employee
   */
  async createOnboarding(onboardingData: Partial<Onboarding>): Promise<Onboarding> {
    try {
      const onboardingRepository = getRepository(Onboarding);
      const onboarding = onboardingRepository.create(onboardingData);
      return await onboardingRepository.save(onboarding);
    } catch (error) {
      console.error('Error creating onboarding:', error);
      throw error;
    }
  }

  /**
   * Update onboarding status
   */
  async updateOnboardingStatus(
    id: string,
    status: OnboardingStatus,
    phase?: OnboardingPhase,
  ): Promise<Onboarding> {
    try {
      const onboardingRepository = getRepository(Onboarding);
      const onboarding = await onboardingRepository.findOne({ where: { id } });

      if (!onboarding) {
        throw new Error('Onboarding not found');
      }

      onboarding.status = status;

      if (phase) {
        onboarding.currentPhase = phase;
      }

      if (status === OnboardingStatus.COMPLETED) {
        onboarding.actualCompletionDate = new Date();
      }

      return await onboardingRepository.save(onboarding);
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  }

  /**
   * Advance onboarding phase
   */
  async advanceOnboardingPhase(id: string): Promise<Onboarding> {
    try {
      const onboardingRepository = getRepository(Onboarding);
      const onboarding = await onboardingRepository.findOne({ where: { id } });

      if (!onboarding) {
        throw new Error('Onboarding not found');
      }

      // Define phase progression
      const phaseOrder = [
        OnboardingPhase.PRE_BOARDING,
        OnboardingPhase.FIRST_DAY,
        OnboardingPhase.FIRST_WEEK,
        OnboardingPhase.FIRST_MONTH,
        OnboardingPhase.FIRST_QUARTER,
      ];

      const currentIndex = phaseOrder.indexOf(onboarding.currentPhase);
      if (currentIndex < phaseOrder.length - 1) {
        onboarding.currentPhase = phaseOrder[currentIndex + 1];
      }

      return await onboardingRepository.save(onboarding);
    } catch (error) {
      console.error('Error advancing onboarding phase:', error);
      throw error;
    }
  }

  /**
   * Search onboardings
   */
  async searchOnboardings(
    filters: OnboardingFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ onboardings: Onboarding[]; total: number; page: number; totalPages: number }> {
    try {
      const onboardingRepository = getRepository(Onboarding);
      let query = onboardingRepository
        .createQueryBuilder('onboarding')
        .leftJoinAndSelect('onboarding.employee', 'emp')
        .leftJoinAndSelect('emp.user', 'user')
        .leftJoinAndSelect('emp.department', 'dept')
        .leftJoinAndSelect('onboarding.assignedTo', 'assignedTo');

      // Apply filters
      if (filters.status) {
        query = query.andWhere('onboarding.status = :status', { status: filters.status });
      }

      if (filters.phase) {
        query = query.andWhere('onboarding.currentPhase = :phase', { phase: filters.phase });
      }

      if (filters.assignedTo) {
        query = query.andWhere('onboarding.assignedTo = :assignedTo', {
          assignedTo: filters.assignedTo,
        });
      }

      if (filters.startDateFrom) {
        query = query.andWhere('onboarding.startDate >= :startDateFrom', {
          startDateFrom: filters.startDateFrom,
        });
      }

      if (filters.startDateTo) {
        query = query.andWhere('onboarding.startDate <= :startDateTo', {
          startDateTo: filters.startDateTo,
        });
      }

      if (filters.searchTerm) {
        query = query.andWhere(
          '(emp.firstName ILIKE :searchTerm OR emp.lastName ILIKE :searchTerm)',
          { searchTerm: `%${filters.searchTerm}%` },
        );
      }

      // Get total count
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by start date
      query = query.orderBy('onboarding.startDate', 'DESC');

      const onboardings = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      return {
        onboardings,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching onboardings:', error);
      throw error;
    }
  }

  /**
   * Create onboarding task
   */
  async createOnboardingTask(taskData: Partial<OnboardingTask>): Promise<OnboardingTask> {
    try {
      const taskRepository = getRepository(OnboardingTask);
      const task = taskRepository.create(taskData);
      return await taskRepository.save(task);
    } catch (error) {
      console.error('Error creating onboarding task:', error);
      throw error;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    completionNotes?: string,
  ): Promise<OnboardingTask> {
    try {
      const taskRepository = getRepository(OnboardingTask);
      const task = await taskRepository.findOne({ where: { id } });

      if (!task) {
        throw new Error('Task not found');
      }

      task.status = status;

      if (status === TaskStatus.COMPLETED) {
        task.completedDate = new Date();
        if (completionNotes) {
          task.completionNotes = completionNotes;
        }
      }

      return await taskRepository.save(task);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Search tasks
   */
  async searchTasks(
    filters: TaskFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ tasks: OnboardingTask[]; total: number; page: number; totalPages: number }> {
    try {
      const taskRepository = getRepository(OnboardingTask);
      let query = taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.onboarding', 'onboarding')
        .leftJoinAndSelect('onboarding.employee', 'emp');

      // Apply filters
      if (filters.onboardingId) {
        query = query.andWhere('task.onboardingId = :onboardingId', {
          onboardingId: filters.onboardingId,
        });
      }

      if (filters.status) {
        query = query.andWhere('task.status = :status', { status: filters.status });
      }

      if (filters.priority) {
        query = query.andWhere('task.priority = :priority', { priority: filters.priority });
      }

      if (filters.category) {
        query = query.andWhere('task.category = :category', { category: filters.category });
      }

      if (filters.assignedTo) {
        query = query.andWhere('task.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
      }

      if (filters.dueDateFrom) {
        query = query.andWhere('task.dueDate >= :dueDateFrom', {
          dueDateFrom: filters.dueDateFrom,
        });
      }

      if (filters.dueDateTo) {
        query = query.andWhere('task.dueDate <= :dueDateTo', { dueDateTo: filters.dueDateTo });
      }

      // Get total count
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by priority and due date
      query = query.orderBy('task.priority', 'DESC').addOrderBy('task.dueDate', 'ASC');

      const tasks = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      return {
        tasks,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  }

  /**
   * Get onboarding progress
   */
  async getOnboardingProgress(onboardingId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completionPercentage: number;
    phaseProgress: Record<OnboardingPhase, number>;
  }> {
    try {
      const taskRepository = getRepository(OnboardingTask);
      const onboardingRepository = getRepository(Onboarding);

      const onboarding = await onboardingRepository.findOne({ where: { id: onboardingId } });
      if (!onboarding) {
        throw new Error('Onboarding not found');
      }

      const tasks = await taskRepository.find({ where: { onboardingId } });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task) => task.status === TaskStatus.COMPLETED).length;
      const pendingTasks = tasks.filter((task) => task.status === TaskStatus.PENDING).length;
      const inProgressTasks = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length;
      const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Calculate phase progress (placeholder - will implement actual phase-based task grouping)
      const phaseProgress: Record<OnboardingPhase, number> = {
        [OnboardingPhase.PRE_BOARDING]: 0,
        [OnboardingPhase.FIRST_DAY]: 0,
        [OnboardingPhase.FIRST_WEEK]: 0,
        [OnboardingPhase.FIRST_MONTH]: 0,
        [OnboardingPhase.FIRST_QUARTER]: 0,
      };

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
        phaseProgress,
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      throw error;
    }
  }

  /**
   * Create onboarding template
   */
  async createOnboardingTemplate(templateData: Partial<Onboarding>): Promise<Onboarding> {
    try {
      const onboardingRepository = getRepository(Onboarding);
      const template = onboardingRepository.create({
        ...templateData,
        isTemplate: true,
        employeeId: 'TEMPLATE', // Placeholder for template
        status: OnboardingStatus.NOT_STARTED,
      });
      return await onboardingRepository.save(template);
    } catch (error) {
      console.error('Error creating onboarding template:', error);
      throw error;
    }
  }

  /**
   * Clone onboarding from template
   */
  async cloneOnboardingFromTemplate(templateId: string, employeeId: string): Promise<Onboarding> {
    try {
      const onboardingRepository = getRepository(Onboarding);
      const taskRepository = getRepository(OnboardingTask);

      // Get template
      const template = await onboardingRepository.findOne({
        where: { id: templateId, isTemplate: true },
      });
      if (!template) {
        throw new Error('Onboarding template not found');
      }

      // Create new onboarding for employee
      const newOnboarding = onboardingRepository.create({
        employeeId,
        status: OnboardingStatus.NOT_STARTED,
        currentPhase: OnboardingPhase.PRE_BOARDING,
        startDate: new Date(),
        goals: template.goals,
        customFields: template.customFields,
        assignedTo: template.assignedTo,
      });

      const savedOnboarding = await onboardingRepository.save(newOnboarding);

      // Clone tasks from template
      const templateTasks = await taskRepository.find({ where: { onboardingId: templateId } });

      for (const templateTask of templateTasks) {
        const newTask = taskRepository.create({
          onboardingId: savedOnboarding.id,
          title: templateTask.title,
          description: templateTask.description,
          category: templateTask.category,
          priority: templateTask.priority,
          orderIndex: templateTask.orderIndex,
          instructions: templateTask.instructions,
          requiredDocuments: templateTask.requiredDocuments,
          estimatedDuration: templateTask.estimatedDuration,
          isRequired: templateTask.isRequired,
          dependencies: templateTask.dependencies,
        });

        await taskRepository.save(newTask);
      }

      return savedOnboarding;
    } catch (error) {
      console.error('Error cloning onboarding from template:', error);
      throw error;
    }
  }

  /**
   * Get onboarding analytics
   */
  async getOnboardingAnalytics(): Promise<{
    totalOnboardings: number;
    activeOnboardings: number;
    completedOnboardings: number;
    averageTimeToComplete: number;
    phaseDistribution: Record<OnboardingPhase, number>;
    taskCompletionRate: number;
    satisfactionRating: number;
  }> {
    try {
      const onboardingRepository = getRepository(Onboarding);
      const taskRepository = getRepository(OnboardingTask);

      const [totalOnboardings, activeOnboardings, completedOnboardings, allOnboardings, allTasks] =
        await Promise.all([
          onboardingRepository.count({ where: { isTemplate: false } }),
          onboardingRepository.count({
            where: { status: OnboardingStatus.IN_PROGRESS, isTemplate: false },
          }),
          onboardingRepository.count({
            where: { status: OnboardingStatus.COMPLETED, isTemplate: false },
          }),
          onboardingRepository.find({ where: { isTemplate: false } }),
          taskRepository.find(),
        ]);

      // Calculate average time to complete
      const completedOnboardingsWithDates = allOnboardings.filter(
        (o) => o.status === OnboardingStatus.COMPLETED && o.actualCompletionDate,
      );

      let totalDays = 0;
      completedOnboardingsWithDates.forEach((onboarding) => {
        const days = Math.ceil(
          (onboarding.actualCompletionDate!.getTime() - onboarding.startDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        totalDays += days;
      });

      const averageTimeToComplete =
        completedOnboardingsWithDates.length > 0
          ? totalDays / completedOnboardingsWithDates.length
          : 0;

      // Calculate phase distribution
      const phaseDistribution: Record<OnboardingPhase, number> = {
        [OnboardingPhase.PRE_BOARDING]: 0,
        [OnboardingPhase.FIRST_DAY]: 0,
        [OnboardingPhase.FIRST_WEEK]: 0,
        [OnboardingPhase.FIRST_MONTH]: 0,
        [OnboardingPhase.FIRST_QUARTER]: 0,
      };

      allOnboardings.forEach((onboarding) => {
        if (phaseDistribution[onboarding.currentPhase] !== undefined) {
          phaseDistribution[onboarding.currentPhase]++;
        }
      });

      // Calculate task completion rate
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter((task) => task.status === TaskStatus.COMPLETED).length;
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Calculate average satisfaction rating
      const onboardingsWithRating = allOnboardings.filter((o) => o.satisfactionRating);
      const totalRating = onboardingsWithRating.reduce(
        (sum, o) => sum + (o.satisfactionRating || 0),
        0,
      );
      const satisfactionRating =
        onboardingsWithRating.length > 0 ? totalRating / onboardingsWithRating.length : 0;

      return {
        totalOnboardings,
        activeOnboardings,
        completedOnboardings,
        averageTimeToComplete: Math.round(averageTimeToComplete * 10) / 10,
        phaseDistribution,
        taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
        satisfactionRating: Math.round(satisfactionRating * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting onboarding analytics:', error);
      throw error;
    }
  }
}
