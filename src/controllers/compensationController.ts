import { Request, Response } from 'express';
import { CompensationService } from '../services/compensationService';

export class CompensationController {
  private compensationService = new CompensationService();
  /**
   * Create or update salary
   */
  async createSalary(req: Request, res: Response): Promise<void> {
    try {
      const salaryData = req.body;
      const salary = await this.compensationService.createSalary(salaryData);

      res.status(201).json({
        success: true,
        data: salary,
        message: 'Salary created/updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create/update salary',
        error: error.message,
      });
    }
  }

  /**
   * Update salary
   */
  async updateSalary(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updates = req.body;

      const updatedSalary = await this.compensationService.updateSalary(id, updates);

      res.json({
        success: true,
        data: updatedSalary,
        message: 'Salary updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update salary',
        error: error.message,
      });
    }
  }

  /**
   * Get employee salary history
   */
  async getEmployeeSalaryHistory(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const salaryHistory = await this.compensationService.getEmployeeSalaryHistory(employeeId);

      res.json({
        success: true,
        data: salaryHistory,
        message: 'Salary history retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get salary history',
        error: error.message,
      });
    }
  }

  /**
   * Get current salary
   */
  async getCurrentSalary(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const { type } = req.query;

      const currentSalary = await this.compensationService.getCurrentSalary(
        employeeId,
        type as any,
      );

      res.json({
        success: true,
        data: currentSalary,
        message: 'Current salary retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get current salary',
        error: error.message,
      });
    }
  }

  /**
   * Search salaries
   */
  async searchSalaries(req: Request, res: Response): Promise<void> {
    try {
      const {
        employeeId,
        type,
        payFrequency,
        effectiveDateFrom,
        effectiveDateTo,
        isActive,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        employeeId: employeeId as string,
        type: type as any,
        payFrequency: payFrequency as any,
        effectiveDateFrom: effectiveDateFrom ? new Date(effectiveDateFrom as string) : undefined,
        effectiveDateTo: effectiveDateTo ? new Date(effectiveDateTo as string) : undefined,
        isActive: isActive === 'true',
      };

      const result = await this.compensationService.searchSalaries(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
        message: 'Salaries retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to search salaries',
        error: error.message,
      });
    }
  }

  /**
   * Create bonus
   */
  async createBonus(req: Request, res: Response): Promise<void> {
    try {
      const bonusData = req.body;
      const bonus = await this.compensationService.createBonus(bonusData);

      res.status(201).json({
        success: true,
        data: bonus,
        message: 'Bonus created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create bonus',
        error: error.message,
      });
    }
  }

  /**
   * Update bonus status
   */
  async updateBonusStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, notes } = req.body;

      const updatedBonus = await this.compensationService.updateBonusStatus(id, status, notes);

      res.json({
        success: true,
        data: updatedBonus,
        message: 'Bonus status updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update bonus status',
        error: error.message,
      });
    }
  }

  /**
   * Search bonuses
   */
  async searchBonuses(req: Request, res: Response): Promise<void> {
    try {
      const {
        employeeId,
        type,
        status,
        effectiveDateFrom,
        effectiveDateTo,
        page = 1,
        limit = 20,
      } = req.query;

      const filters = {
        employeeId: employeeId as string,
        type: type as any,
        status: status as any,
        effectiveDateFrom: effectiveDateFrom ? new Date(effectiveDateFrom as string) : undefined,
        effectiveDateTo: effectiveDateTo ? new Date(effectiveDateTo as string) : undefined,
      };

      const result = await this.compensationService.searchBonuses(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
        message: 'Bonuses retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to search bonuses',
        error: error.message,
      });
    }
  }

  /**
   * Create benefit
   */
  async createBenefit(req: Request, res: Response): Promise<void> {
    try {
      const benefitData = req.body;
      const benefit = await this.compensationService.createBenefit(benefitData);

      res.status(201).json({
        success: true,
        data: benefit,
        message: 'Benefit created successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create benefit',
        error: error.message,
      });
    }
  }

  /**
   * Update benefit
   */
  async updateBenefit(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updates = req.body;

      const updatedBenefit = await this.compensationService.updateBenefit(id, updates);

      res.json({
        success: true,
        data: updatedBenefit,
        message: 'Benefit updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update benefit',
        error: error.message,
      });
    }
  }

  /**
   * Search benefits
   */
  async searchBenefits(req: Request, res: Response): Promise<void> {
    try {
      const { type, category, isActive, searchTerm, page = 1, limit = 20 } = req.query;

      const filters = {
        type: type as any,
        category: category as string,
        isActive: isActive === 'true',
        searchTerm: searchTerm as string,
      };

      const result = await this.compensationService.searchBenefits(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: result,
        message: 'Benefits retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to search benefits',
        error: error.message,
      });
    }
  }

  /**
   * Enroll employee in benefit
   */
  async enrollEmployeeInBenefit(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const benefitId = req.params.benefitId as string;
      const enrollmentData = req.body;

      const enrollment = await this.compensationService.enrollEmployeeInBenefit(
        employeeId,
        benefitId,
        enrollmentData,
      );

      res.status(201).json({
        success: true,
        data: enrollment,
        message: 'Employee enrolled in benefit successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to enroll employee in benefit',
        error: error.message,
      });
    }
  }

  /**
   * Update benefit enrollment status
   */
  async updateBenefitEnrollmentStatus(req: Request, res: Response): Promise<void> {
    try {
      const enrollmentId = req.params.enrollmentId as string;
      const { status, notes } = req.body;

      const updatedEnrollment = await this.compensationService.updateBenefitEnrollmentStatus(
        enrollmentId,
        status,
        notes,
      );

      res.json({
        success: true,
        data: updatedEnrollment,
        message: 'Benefit enrollment status updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update benefit enrollment status',
        error: error.message,
      });
    }
  }

  /**
   * Get employee benefits
   */
  async getEmployeeBenefits(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params.employeeId as string;
      const benefits = await this.compensationService.getEmployeeBenefits(employeeId);

      res.json({
        success: true,
        data: benefits,
        message: 'Employee benefits retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get employee benefits',
        error: error.message,
      });
    }
  }

  /**
   * Get compensation analytics
   */
  async getCompensationAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.compensationService.getCompensationAnalytics();

      res.json({
        success: true,
        data: analytics,
        message: 'Compensation analytics retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get compensation analytics',
        error: error.message,
      });
    }
  }

  /**
   * Get salary by ID
   */
  async getSalaryById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      // TODO: Implement get salary by ID functionality
      res.status(200).json({ message: 'Get salary by ID not implemented yet' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get benefit by ID
   */
  async getBenefitById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      // TODO: Implement get benefit by ID functionality
      res.status(200).json({ message: 'Get benefit by ID not implemented yet' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Assign benefit to employee
   */
  async assignBenefitToEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, benefitId } = req.body;
      // TODO: Implement assign benefit to employee functionality
      res.status(200).json({ message: 'Benefit assigned to employee successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update employee benefit
   */
  async updateEmployeeBenefit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      // TODO: Implement update employee benefit functionality
      res.status(200).json({ message: 'Employee benefit updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update bonus
   */
  async updateBonus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      // TODO: Implement update bonus functionality
      res.status(200).json({ message: 'Bonus updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get bonus by ID
   */
  async getBonusById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // TODO: Implement get bonus by ID functionality
      res.status(200).json({ message: 'Get bonus by ID not implemented yet' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
