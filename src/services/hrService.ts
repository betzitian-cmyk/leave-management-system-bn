import { getRepository } from 'typeorm';
import { Employee, Department, LeaveRequest, LeaveBalance, LeaveType } from '../models';

export interface EmployeeOverview {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  newHiresThisMonth: number;
  terminationsThisMonth: number;
  departmentDistribution: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  positionDistribution: Array<{
    position: string;
    count: number;
    percentage: number;
  }>;
}

export interface EmployeeSearchFilters {
  departmentId?: string;
  position?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  hireDateFrom?: Date;
  hireDateTo?: Date;
  searchTerm?: string;
}

export interface EmployeeAnalytics {
  turnoverRate: number;
  averageTenure: number;
  leaveUtilization: number;
  departmentPerformance: Array<{
    department: string;
    employeeCount: number;
    avgLeaveDays: number;
    avgPerformance: number;
  }>;
}

export class HRService {
  /**
   * Get comprehensive employee overview for HR dashboard
   */
  async getEmployeeOverview(): Promise<EmployeeOverview> {
    try {
      const employeeRepository = getRepository(Employee);
      const departmentRepository = getRepository(Department);
      const leaveRequestRepository = getRepository(LeaveRequest);

      // Get total counts
      const totalEmployees = await employeeRepository.count();
      const activeEmployees = await employeeRepository.count({ where: { status: 'ACTIVE' } });

      // Get employees currently on leave
      const currentDate = new Date();
      const onLeaveEmployees = await leaveRequestRepository
        .createQueryBuilder('lr')
        .where('lr.startDate <= :currentDate', { currentDate })
        .andWhere('lr.endDate >= :currentDate', { currentDate })
        .andWhere('lr.status = :status', { status: 'APPROVED' })
        .getCount();

      // Get new hires this month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const newHiresThisMonth = await employeeRepository
        .createQueryBuilder('emp')
        .where('emp.hireDate >= :startOfMonth', { startOfMonth })
        .andWhere('emp.hireDate <= :currentDate', { currentDate })
        .getCount();

      // Get terminations this month (assuming we have a termination date field)
      const terminationsThisMonth = 0; // Will implement when we add termination tracking

      // Get department distribution
      const departmentStats = await departmentRepository
        .createQueryBuilder('dept')
        .leftJoin('dept.employees', 'emp')
        .select('dept.name', 'department')
        .addSelect('COUNT(emp.id)', 'count')
        .groupBy('dept.id')
        .addGroupBy('dept.name')
        .getRawMany();

      const departmentDistribution = departmentStats.map((stat) => ({
        department: stat.department,
        count: parseInt(stat.count),
        percentage: Math.round((parseInt(stat.count) / totalEmployees) * 100),
      }));

      // Get position distribution
      const positionStats = await employeeRepository
        .createQueryBuilder('emp')
        .select('emp.position', 'position')
        .addSelect('COUNT(emp.id)', 'count')
        .groupBy('emp.position')
        .getRawMany();

      const positionDistribution = positionStats.map((stat) => ({
        position: stat.position,
        count: parseInt(stat.count),
        percentage: Math.round((parseInt(stat.count) / totalEmployees) * 100),
      }));

      return {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        newHiresThisMonth,
        terminationsThisMonth,
        departmentDistribution,
        positionDistribution,
      };
    } catch (error) {
      console.error('Error getting employee overview:', error);
      throw error;
    }
  }

  /**
   * Search and filter employees with pagination
   */
  async searchEmployees(
    filters: EmployeeSearchFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ employees: Employee[]; total: number; page: number; totalPages: number }> {
    try {
      const employeeRepository = getRepository(Employee);
      let query = employeeRepository
        .createQueryBuilder('emp')
        .leftJoinAndSelect('emp.department', 'dept')
        .leftJoinAndSelect('emp.manager', 'manager')
        .leftJoinAndSelect('emp.user', 'user')
        .leftJoinAndSelect('user.role', 'role');

      // Apply filters
      if (filters.departmentId) {
        query = query.andWhere('emp.departmentId = :departmentId', {
          departmentId: filters.departmentId,
        });
      }

      if (filters.position) {
        query = query.andWhere('emp.position = :position', { position: filters.position });
      }

      if (filters.status) {
        query = query.andWhere('emp.status = :status', { status: filters.status });
      }

      if (filters.hireDateFrom) {
        query = query.andWhere('emp.hireDate >= :hireDateFrom', {
          hireDateFrom: filters.hireDateFrom,
        });
      }

      if (filters.hireDateTo) {
        query = query.andWhere('emp.hireDate <= :hireDateTo', { hireDateTo: filters.hireDateTo });
      }

      if (filters.searchTerm) {
        query = query.andWhere(
          '(emp.firstName ILIKE :searchTerm OR emp.lastName ILIKE :searchTerm OR emp.email ILIKE :searchTerm)',
          { searchTerm: `%${filters.searchTerm}%` },
        );
      }

      // Get total count
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by name
      query = query.orderBy('emp.firstName', 'ASC').addOrderBy('emp.lastName', 'ASC');

      const employees = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      return {
        employees,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }

  /**
   * Get employee analytics and insights
   */
  async getEmployeeAnalytics(): Promise<EmployeeAnalytics> {
    try {
      const employeeRepository = getRepository(Employee);
      const leaveRequestRepository = getRepository(LeaveRequest);
      const leaveBalanceRepository = getRepository(LeaveBalance);

      // Calculate turnover rate (assuming we have termination tracking)
      const turnoverRate = 0; // Will implement when we add termination tracking

      // Calculate average tenure
      const employees = await employeeRepository.find({ select: ['hireDate'] });
      const totalTenure = employees.reduce((sum, emp) => {
        const hireDate = new Date(emp.hireDate);
        const currentDate = new Date();
        const tenureInYears =
          (currentDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return sum + tenureInYears;
      }, 0);
      const averageTenure = totalTenure / employees.length;

      // Calculate leave utilization
      const totalLeaveDays = await leaveRequestRepository
        .createQueryBuilder('lr')
        .where('lr.status = :status', { status: 'APPROVED' })
        .andWhere('lr.startDate >= :startDate', {
          startDate: new Date(new Date().getFullYear(), 0, 1),
        })
        .getCount();

      const leaveUtilization = totalLeaveDays / employees.length;

      // Get department performance metrics
      const departmentPerformance = await this.getDepartmentPerformanceMetrics();

      return {
        turnoverRate,
        averageTenure: Math.round(averageTenure * 10) / 10,
        leaveUtilization: Math.round(leaveUtilization * 10) / 10,
        departmentPerformance,
      };
    } catch (error) {
      console.error('Error getting employee analytics:', error);
      throw error;
    }
  }

  /**
   * Get department performance metrics
   */
  private async getDepartmentPerformanceMetrics(): Promise<
    Array<{
      department: string;
      employeeCount: number;
      avgLeaveDays: number;
      avgPerformance: number;
    }>
  > {
    try {
      const departmentRepository = getRepository(Department);
      const leaveRequestRepository = getRepository(LeaveRequest);

      const departments = await departmentRepository.find({ relations: ['employees'] });
      const metrics = [];

      for (const dept of departments) {
        const employeeCount = dept.employees.length;

        // Calculate average leave days for department
        const deptLeaveRequests = await leaveRequestRepository
          .createQueryBuilder('lr')
          .leftJoin('lr.employee', 'emp')
          .where('emp.departmentId = :departmentId', { departmentId: dept.id })
          .andWhere('lr.status = :status', { status: 'APPROVED' })
          .andWhere('lr.startDate >= :startDate', {
            startDate: new Date(new Date().getFullYear(), 0, 1),
          })
          .getCount();

        const avgLeaveDays = employeeCount > 0 ? deptLeaveRequests / employeeCount : 0;

        // Average performance (placeholder - will implement when we add performance tracking)
        const avgPerformance = 0;

        metrics.push({
          department: dept.name,
          employeeCount,
          avgLeaveDays: Math.round(avgLeaveDays * 10) / 10,
          avgPerformance,
        });
      }

      return metrics;
    } catch (error) {
      console.error('Error getting department performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get employee details with comprehensive information
   */
  async getEmployeeDetails(employeeId: string): Promise<Employee | null> {
    try {
      const employeeRepository = getRepository(Employee);
      return await employeeRepository.findOne({
        where: { id: employeeId },
        relations: ['department', 'manager', 'leaveRequests', 'leaveBalances', 'user', 'user.role'],
      });
    } catch (error) {
      console.error('Error getting employee details:', error);
      throw error;
    }
  }

  /**
   * Update employee information (HR operations)
   */
  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    try {
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({ where: { id: employeeId } });

      if (!employee) {
        throw new Error('Employee not found');
      }

      // Update allowed fields
      Object.assign(employee, updates);
      employee.updatedAt = new Date();

      return await employeeRepository.save(employee);
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  /**
   * Get HR dashboard summary statistics
   */
  async getHRDashboardSummary(): Promise<{
    overview: EmployeeOverview;
    analytics: EmployeeAnalytics;
    recentActivities: any[];
  }> {
    try {
      const [overview, analytics] = await Promise.all([
        this.getEmployeeOverview(),
        this.getEmployeeAnalytics(),
      ]);

      // Get recent activities (placeholder - will implement activity tracking)
      const recentActivities: any[] = [];

      return {
        overview,
        analytics,
        recentActivities,
      };
    } catch (error) {
      console.error('Error getting HR dashboard summary:', error);
      throw error;
    }
  }
}
