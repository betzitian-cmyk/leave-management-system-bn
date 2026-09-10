import { getRepository } from 'typeorm';
import {
  Salary,
  Bonus,
  Benefit,
  EmployeeBenefit,
  Employee,
  SalaryType,
  PayFrequency,
  BonusType,
  BonusStatus,
  BenefitType,
  EnrollmentStatus,
} from '../models';

export interface SalaryFilters {
  employeeId?: string;
  type?: SalaryType;
  payFrequency?: PayFrequency;
  effectiveDateFrom?: Date;
  effectiveDateTo?: Date;
  isActive?: boolean;
}

export interface BonusFilters {
  employeeId?: string;
  type?: BonusType;
  status?: BonusStatus;
  effectiveDateFrom?: Date;
  effectiveDateTo?: Date;
}

export interface BenefitFilters {
  type?: BenefitType;
  category?: string;
  isActive?: boolean;
  searchTerm?: string;
}

export class CompensationService {
  /**
   * Create or update salary
   */
  async createSalary(salaryData: Partial<Salary>): Promise<Salary> {
    try {
      const salaryRepository = getRepository(Salary);

      // If there's an existing active salary of the same type, deactivate it
      if (salaryData.employeeId && salaryData.type) {
        const existingSalary = await salaryRepository.findOne({
          where: {
            employeeId: salaryData.employeeId,
            type: salaryData.type,
            isActive: true,
          },
        });

        if (existingSalary) {
          existingSalary.isActive = false;
          existingSalary.endDate = new Date();
          await salaryRepository.save(existingSalary);
        }
      }

      const salary = salaryRepository.create(salaryData);
      return await salaryRepository.save(salary);
    } catch (error) {
      console.error('Error creating salary:', error);
      throw error;
    }
  }

  /**
   * Update salary
   */
  async updateSalary(id: string, updates: Partial<Salary>): Promise<Salary> {
    try {
      const salaryRepository = getRepository(Salary);
      const salary = await salaryRepository.findOne({ where: { id } });

      if (!salary) {
        throw new Error('Salary not found');
      }

      Object.assign(salary, updates);
      return await salaryRepository.save(salary);
    } catch (error) {
      console.error('Error updating salary:', error);
      throw error;
    }
  }

  /**
   * Get employee salary history
   */
  async getEmployeeSalaryHistory(employeeId: string): Promise<Salary[]> {
    try {
      const salaryRepository = getRepository(Salary);
      return await salaryRepository.find({
        where: { employeeId },
        order: { effectiveDate: 'DESC' },
      });
    } catch (error) {
      console.error('Error getting employee salary history:', error);
      throw error;
    }
  }

  /**
   * Get current salary
   */
  async getCurrentSalary(
    employeeId: string,
    type: SalaryType = SalaryType.BASE_SALARY,
  ): Promise<Salary | null> {
    try {
      const salaryRepository = getRepository(Salary);
      return await salaryRepository.findOne({
        where: {
          employeeId,
          type,
          isActive: true,
        },
      });
    } catch (error) {
      console.error('Error getting current salary:', error);
      throw error;
    }
  }

  /**
   * Search salaries
   */
  async searchSalaries(
    filters: SalaryFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ salaries: Salary[]; total: number; page: number; totalPages: number }> {
    try {
      const salaryRepository = getRepository(Salary);
      let query = salaryRepository
        .createQueryBuilder('salary')
        .leftJoinAndSelect('salary.employee', 'emp');

      // Apply filters
      if (filters.employeeId) {
        query = query.andWhere('salary.employeeId = :employeeId', {
          employeeId: filters.employeeId,
        });
      }

      if (filters.type) {
        query = query.andWhere('salary.type = :type', { type: filters.type });
      }

      if (filters.payFrequency) {
        query = query.andWhere('salary.payFrequency = :payFrequency', {
          payFrequency: filters.payFrequency,
        });
      }

      if (filters.effectiveDateFrom) {
        query = query.andWhere('salary.effectiveDate >= :effectiveDateFrom', {
          effectiveDateFrom: filters.effectiveDateFrom,
        });
      }

      if (filters.effectiveDateTo) {
        query = query.andWhere('salary.effectiveDate <= :effectiveDateTo', {
          effectiveDateTo: filters.effectiveDateTo,
        });
      }

      if (filters.isActive !== undefined) {
        query = query.andWhere('salary.isActive = :isActive', { isActive: filters.isActive });
      }

      // Get total count
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by effective date
      query = query.orderBy('salary.effectiveDate', 'DESC');

      const salaries = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      return {
        salaries,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching salaries:', error);
      throw error;
    }
  }

  /**
   * Create bonus
   */
  async createBonus(bonusData: Partial<Bonus>): Promise<Bonus> {
    try {
      const bonusRepository = getRepository(Bonus);
      const bonus = bonusRepository.create(bonusData);
      return await bonusRepository.save(bonus);
    } catch (error) {
      console.error('Error creating bonus:', error);
      throw error;
    }
  }

  /**
   * Update bonus status
   */
  async updateBonusStatus(id: string, status: BonusStatus, notes?: string): Promise<Bonus> {
    try {
      const bonusRepository = getRepository(Bonus);
      const bonus = await bonusRepository.findOne({ where: { id } });

      if (!bonus) {
        throw new Error('Bonus not found');
      }

      bonus.status = status;

      if (status === BonusStatus.APPROVED) {
        bonus.approvedAt = new Date();
      } else if (status === BonusStatus.PAID) {
        bonus.paymentDate = new Date();
      }

      if (notes) {
        bonus.notes = notes;
      }

      return await bonusRepository.save(bonus);
    } catch (error) {
      console.error('Error updating bonus status:', error);
      throw error;
    }
  }

  /**
   * Search bonuses
   */
  async searchBonuses(
    filters: BonusFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ bonuses: Bonus[]; total: number; page: number; totalPages: number }> {
    try {
      const bonusRepository = getRepository(Bonus);
      let query = bonusRepository
        .createQueryBuilder('bonus')
        .leftJoinAndSelect('bonus.employee', 'emp');

      // Apply filters
      if (filters.employeeId) {
        query = query.andWhere('bonus.employeeId = :employeeId', {
          employeeId: filters.employeeId,
        });
      }

      if (filters.type) {
        query = query.andWhere('bonus.type = :type', { type: filters.type });
      }

      if (filters.status) {
        query = query.andWhere('bonus.status = :status', { status: filters.status });
      }

      if (filters.effectiveDateFrom) {
        query = query.andWhere('bonus.effectiveDate >= :effectiveDateFrom', {
          effectiveDateFrom: filters.effectiveDateFrom,
        });
      }

      if (filters.effectiveDateTo) {
        query = query.andWhere('bonus.effectiveDate <= :effectiveDateTo', {
          effectiveDateTo: filters.effectiveDateTo,
        });
      }

      // Get total count
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by effective date
      query = query.orderBy('bonus.effectiveDate', 'DESC');

      const bonuses = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      return {
        bonuses,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching bonuses:', error);
      throw error;
    }
  }

  /**
   * Create benefit
   */
  async createBenefit(benefitData: Partial<Benefit>): Promise<Benefit> {
    try {
      const benefitRepository = getRepository(Benefit);
      const benefit = benefitRepository.create(benefitData);
      return await benefitRepository.save(benefit);
    } catch (error) {
      console.error('Error creating benefit:', error);
      throw error;
    }
  }

  /**
   * Update benefit
   */
  async updateBenefit(id: string, updates: Partial<Benefit>): Promise<Benefit> {
    try {
      const benefitRepository = getRepository(Benefit);
      const benefit = await benefitRepository.findOne({ where: { id } });

      if (!benefit) {
        throw new Error('Benefit not found');
      }

      Object.assign(benefit, updates);
      return await benefitRepository.save(benefit);
    } catch (error) {
      console.error('Error updating benefit:', error);
      throw error;
    }
  }

  /**
   * Search benefits
   */
  async searchBenefits(
    filters: BenefitFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ benefits: Benefit[]; total: number; page: number; totalPages: number }> {
    try {
      const benefitRepository = getRepository(Benefit);
      let query = benefitRepository.createQueryBuilder('benefit');

      // Apply filters
      if (filters.type) {
        query = query.andWhere('benefit.type = :type', { type: filters.type });
      }

      if (filters.category) {
        query = query.andWhere('benefit.category = :category', { category: filters.category });
      }

      if (filters.isActive !== undefined) {
        query = query.andWhere('benefit.isActive = :isActive', { isActive: filters.isActive });
      }

      if (filters.searchTerm) {
        query = query.andWhere(
          '(benefit.name ILIKE :searchTerm OR benefit.description ILIKE :searchTerm)',
          { searchTerm: `%${filters.searchTerm}%` },
        );
      }

      // Get total count
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by name
      query = query.orderBy('benefit.name', 'ASC');

      const benefits = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      return {
        benefits,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching benefits:', error);
      throw error;
    }
  }

  /**
   * Enroll employee in benefit
   */
  async enrollEmployeeInBenefit(
    employeeId: string,
    benefitId: string,
    enrollmentData: Partial<EmployeeBenefit>,
  ): Promise<EmployeeBenefit> {
    try {
      const employeeBenefitRepository = getRepository(EmployeeBenefit);

      // Check if already enrolled
      const existingEnrollment = await employeeBenefitRepository.findOne({
        where: {
          employeeId,
          benefitId,
          status: EnrollmentStatus.ACTIVE,
        },
      });

      if (existingEnrollment) {
        throw new Error('Employee is already enrolled in this benefit');
      }

      const enrollment = employeeBenefitRepository.create({
        employeeId,
        benefitId,
        status: EnrollmentStatus.PENDING,
        enrollmentDate: new Date(),
        ...enrollmentData,
      });

      return await employeeBenefitRepository.save(enrollment);
    } catch (error) {
      console.error('Error enrolling employee in benefit:', error);
      throw error;
    }
  }

  /**
   * Update benefit enrollment status
   */
  async updateBenefitEnrollmentStatus(
    enrollmentId: string,
    status: EnrollmentStatus,
    notes?: string,
  ): Promise<EmployeeBenefit> {
    try {
      const employeeBenefitRepository = getRepository(EmployeeBenefit);
      const enrollment = await employeeBenefitRepository.findOne({ where: { id: enrollmentId } });

      if (!enrollment) {
        throw new Error('Benefit enrollment not found');
      }

      enrollment.status = status;

      if (status === EnrollmentStatus.ACTIVE) {
        enrollment.effectiveDate = new Date();
      } else if (status === EnrollmentStatus.TERMINATED) {
        enrollment.terminatedAt = new Date();
      }

      if (notes) {
        enrollment.notes = notes;
      }

      return await employeeBenefitRepository.save(enrollment);
    } catch (error) {
      console.error('Error updating benefit enrollment status:', error);
      throw error;
    }
  }

  /**
   * Get employee benefits
   */
  async getEmployeeBenefits(employeeId: string): Promise<EmployeeBenefit[]> {
    try {
      const employeeBenefitRepository = getRepository(EmployeeBenefit);
      return await employeeBenefitRepository.find({
        where: { employeeId },
        relations: ['benefit'],
        order: { enrollmentDate: 'DESC' },
      });
    } catch (error) {
      console.error('Error getting employee benefits:', error);
      throw error;
    }
  }

  /**
   * Get compensation analytics
   */
  async getCompensationAnalytics(): Promise<{
    totalSalaryCost: number;
    averageSalary: number;
    totalBonusCost: number;
    totalBenefitsCost: number;
    salaryDistribution: Array<{ range: string; count: number; percentage: number }>;
    departmentSalaryComparison: Array<{
      department: string;
      averageSalary: number;
      employeeCount: number;
    }>;
  }> {
    try {
      const salaryRepository = getRepository(Salary);
      const bonusRepository = getRepository(Bonus);
      const employeeBenefitRepository = getRepository(EmployeeBenefit);
      const employeeRepository = getRepository(Employee);

      // Get active salaries
      const activeSalaries = await salaryRepository.find({
        where: { isActive: true, type: SalaryType.BASE_SALARY },
        relations: ['employee', 'employee.department'],
      });

      // Calculate total salary cost
      const totalSalaryCost = activeSalaries.reduce(
        (sum, salary) => sum + Number(salary.amount),
        0,
      );
      const averageSalary = totalSalaryCost / activeSalaries.length;

      // Get total bonus cost for current year
      const currentYear = new Date().getFullYear();
      const yearBonuses = await bonusRepository
        .createQueryBuilder('bonus')
        .where('bonus.status = :status', { status: BonusStatus.PAID })
        .andWhere('bonus.effectiveDate >= :startOfYear', {
          startOfYear: new Date(currentYear, 0, 1),
        })
        .getMany();
      const totalBonusCost = yearBonuses.reduce((sum, bonus) => sum + Number(bonus.amount), 0);

      // Get total benefits cost
      const activeBenefits = await employeeBenefitRepository.find({
        where: { status: EnrollmentStatus.ACTIVE },
        relations: ['benefit'],
      });
      const totalBenefitsCost = activeBenefits.reduce((sum, enrollment) => {
        return sum + Number(enrollment.benefit.cost || 0);
      }, 0);

      // Calculate salary distribution
      const salaryRanges = [
        { min: 0, max: 50000, label: '$0 - $50k' },
        { min: 50000, max: 75000, label: '$50k - $75k' },
        { min: 75000, max: 100000, label: '$75k - $100k' },
        { min: 100000, max: 150000, label: '$100k - $150k' },
        { min: 150000, max: Infinity, label: '$150k+' },
      ];

      const salaryDistribution = salaryRanges.map((range) => {
        const count = activeSalaries.filter(
          (salary) => Number(salary.amount) >= range.min && Number(salary.amount) < range.max,
        ).length;
        const percentage = (count / activeSalaries.length) * 100;

        return {
          range: range.label,
          count,
          percentage: Math.round(percentage * 100) / 100,
        };
      });

      // Calculate department salary comparison
      const departmentSalaries = new Map<string, { total: number; count: number }>();

      activeSalaries.forEach((salary) => {
        const deptName = salary.employee.department?.name || 'Unknown';
        const current = departmentSalaries.get(deptName) || { total: 0, count: 0 };
        current.total += Number(salary.amount);
        current.count += 1;
        departmentSalaries.set(deptName, current);
      });

      const departmentSalaryComparison = Array.from(departmentSalaries.entries()).map(
        ([department, data]) => ({
          department,
          averageSalary: Math.round((data.total / data.count) * 100) / 100,
          employeeCount: data.count,
        }),
      );

      return {
        totalSalaryCost: Math.round(totalSalaryCost * 100) / 100,
        averageSalary: Math.round(averageSalary * 100) / 100,
        totalBonusCost: Math.round(totalBonusCost * 100) / 100,
        totalBenefitsCost: Math.round(totalBenefitsCost * 100) / 100,
        salaryDistribution,
        departmentSalaryComparison,
      };
    } catch (error) {
      console.error('Error getting compensation analytics:', error);
      throw error;
    }
  }
}
