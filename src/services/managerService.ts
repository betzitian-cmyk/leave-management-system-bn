import { getRepository } from 'typeorm';
import { Employee, Department } from '../models';

export interface ManagerHierarchy {
  employeeId: string;
  managerId: string | null;
  managerName: string | null;
  directReports: string[];
  departmentId: string;
  departmentName: string;
  level: number; // 0 = top level, 1 = first level down, etc.
}

export class ManagerService {
  /**
   * Get the complete manager hierarchy for an employee
   */
  async getEmployeeHierarchy(employeeId: string): Promise<ManagerHierarchy | null> {
    try {
      const employeeRepository = getRepository(Employee);

      const employee = await employeeRepository.findOne({
        where: { id: employeeId },
        relations: ['manager', 'department', 'user'],
      });

      if (!employee) {
        return null;
      }

      // Get direct reports
      const directReports = await employeeRepository.find({
        where: { managerId: employeeId },
        select: ['id'],
      });

      // Calculate hierarchy level
      let level = 0;
      let currentManager = employee.manager;
      while (currentManager) {
        level++;
        currentManager = await employeeRepository.findOne({
          where: { id: currentManager.id },
          relations: ['manager'],
        });
      }

      return {
        employeeId: employee.id,
        managerId: employee.managerId,
        managerName: employee.manager
          ? `${employee.manager.user.firstName} ${employee.manager.user.lastName}`
          : null,
        directReports: directReports.map((emp) => emp.id),
        departmentId: employee.departmentId,
        departmentName: employee.department?.name || '',
        level,
      };
    } catch (error) {
      console.error('Error getting employee hierarchy:', error);
      throw error;
    }
  }

  /**
   * Get all employees under a specific manager (including nested levels)
   */
  async getTeamMembers(managerId: string, includeNested: boolean = true): Promise<Employee[]> {
    try {
      const employeeRepository = getRepository(Employee);

      if (!includeNested) {
        // Only direct reports
        return await employeeRepository.find({
          where: { managerId },
          relations: ['department', 'user', 'manager'],
          // Note: firstName and lastName are now computed from User relationship
        });
      }

      // Get all nested team members
      const teamMembers: Employee[] = [];
      const queue: string[] = [managerId];

      while (queue.length > 0) {
        const currentManagerId = queue.shift()!;

        const directReports = await employeeRepository.find({
          where: { managerId: currentManagerId },
          relations: ['department', 'user', 'manager'],
        });

        for (const report of directReports) {
          teamMembers.push(report);
          queue.push(report.id); // Add to queue for next iteration
        }
      }

      return teamMembers.sort(
        (a, b) =>
          a.user.firstName.localeCompare(b.user.firstName) ||
          a.user.lastName.localeCompare(b.user.lastName),
      );
    } catch (error) {
      console.error('Error getting team members:', error);
      throw error;
    }
  }

  /**
   * Check if an employee can manage another employee
   */
  async canManage(managerId: string, employeeId: string): Promise<boolean> {
    try {
      if (managerId === employeeId) {
        return false; // Can't manage yourself
      }

      const employeeRepository = getRepository(Employee);

      // Check if target employee is a direct report
      const employee = await employeeRepository.findOne({
        where: { id: employeeId, managerId },
      });

      if (employee) {
        return true;
      }

      // Check if target employee is in the same department and manager has department management rights
      const manager = await employeeRepository.findOne({
        where: { id: managerId },
        relations: ['department'],
      });

      const targetEmployee = await employeeRepository.findOne({
        where: { id: employeeId },
        relations: ['department'],
      });

      if (manager && targetEmployee && manager.departmentId === targetEmployee.departmentId) {
        // Check if manager has department management role
        return manager.position === 'DEPARTMENT_MANAGER' || manager.position === 'ADMIN';
      }

      return false;
    } catch (error) {
      console.error('Error checking management permissions:', error);
      return false;
    }
  }

  /**
   * Get the approval chain for an employee
   */
  async getApprovalChain(employeeId: string): Promise<Employee[]> {
    try {
      const employeeRepository = getRepository(Employee);
      const approvalChain: Employee[] = [];

      let currentEmployee = await employeeRepository.findOne({
        where: { id: employeeId },
        relations: ['manager'],
      });

      while (currentEmployee?.manager) {
        approvalChain.push(currentEmployee.manager);
        currentEmployee = await employeeRepository.findOne({
          where: { id: currentEmployee.manager.id },
          relations: ['manager'],
        });
      }

      return approvalChain;
    } catch (error) {
      console.error('Error getting approval chain:', error);
      throw error;
    }
  }

  /**
   * Assign a new manager to an employee
   */
  async assignManager(employeeId: string, newManagerId: string, assignedBy: string): Promise<void> {
    try {
      const employeeRepository = getRepository(Employee);

      // Check if the assignment would create a circular reference
      if (await this.wouldCreateCircularReference(employeeId, newManagerId)) {
        throw new Error('Cannot assign manager: would create circular reference');
      }

      // Check if assigner has permission
      const assigner = await employeeRepository.findOne({ where: { id: assignedBy } });
      if (!assigner || (assigner.position !== 'ADMIN' && assigner.position !== 'HR_MANAGER')) {
        throw new Error('Insufficient permissions to assign managers');
      }

      // Update the employee's manager
      await employeeRepository.update(employeeId, { managerId: newManagerId });

      // Log the change (you can integrate this with your audit system)
      console.log(
        `Manager assignment: Employee ${employeeId} now reports to ${newManagerId} (assigned by ${assignedBy})`,
      );
    } catch (error) {
      console.error('Error assigning manager:', error);
      throw error;
    }
  }

  /**
   * Remove manager assignment from an employee
   */
  async removeManager(employeeId: string, removedBy: string): Promise<void> {
    try {
      const employeeRepository = getRepository(Employee);

      // Check if remover has permission
      const remover = await employeeRepository.findOne({ where: { id: removedBy } });
      if (!remover || (remover.position !== 'ADMIN' && remover.position !== 'HR_MANAGER')) {
        throw new Error('Insufficient permissions to remove managers');
      }

      // Remove the manager assignment
      await employeeRepository.update(employeeId, { managerId: null });

      console.log(
        `Manager removal: Employee ${employeeId} no longer reports to anyone (removed by ${removedBy})`,
      );
    } catch (error) {
      console.error('Error removing manager:', error);
      throw error;
    }
  }

  /**
   * Check if assigning a manager would create a circular reference
   */
  private async wouldCreateCircularReference(
    employeeId: string,
    newManagerId: string,
  ): Promise<boolean> {
    try {
      const employeeRepository = getRepository(Employee);

      // Check if the new manager is the employee themselves
      if (employeeId === newManagerId) {
        return true;
      }

      // Check if the new manager reports to the employee (directly or indirectly)
      const queue: string[] = [newManagerId];

      while (queue.length > 0) {
        const currentId = queue.shift()!;

        if (currentId === employeeId) {
          return true; // Circular reference detected
        }

        const currentEmployee = await employeeRepository.findOne({
          where: { id: currentId },
          select: ['managerId'],
        });

        if (currentEmployee?.managerId) {
          queue.push(currentEmployee.managerId);
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking circular reference:', error);
      return true; // Assume circular reference if error occurs
    }
  }

  /**
   * Get department hierarchy
   */
  async getDepartmentHierarchy(departmentId: string): Promise<{
    department: Department;
    employees: Employee[];
    managers: Employee[];
    structure: any;
  }> {
    try {
      const departmentRepository = getRepository(Department);
      const employeeRepository = getRepository(Employee);

      const department = await departmentRepository.findOne({
        where: { id: departmentId },
      });

      if (!department) {
        throw new Error('Department not found');
      }

      const employees = await employeeRepository.find({
        where: { departmentId },
        relations: ['manager'],
        // Note: firstName and lastName are now computed from User relationship
      });

      const managers = employees.filter(
        (emp) => emp.position === 'MANAGER' || emp.position === 'DEPARTMENT_MANAGER',
      );

      // Build department structure
      const structure = {
        departmentId: department.id,
        departmentName: department.name,
        totalEmployees: employees.length,
        managers: managers.length,
        hierarchy: await this.buildDepartmentHierarchy(employees),
      };

      return {
        department,
        employees,
        managers,
        structure,
      };
    } catch (error) {
      console.error('Error getting department hierarchy:', error);
      throw error;
    }
  }

  /**
   * Build visual hierarchy structure for a department
   */
  private async buildDepartmentHierarchy(employees: Employee[]): Promise<any> {
    const hierarchy: any = {
      topLevel: [],
      middleLevel: [],
      bottomLevel: [],
    };

    for (const employee of employees) {
      if (!employee.managerId) {
        hierarchy.topLevel.push({
          id: employee.id,
          name: `${employee.user.firstName} ${employee.user.lastName}`,
          position: employee.position,
          directReports: employees.filter((emp) => emp.managerId === employee.id).length,
        });
      } else {
        const manager = employees.find((emp) => emp.id === employee.managerId);
        if (manager && !manager.managerId) {
          hierarchy.middleLevel.push({
            id: employee.id,
            name: `${employee.user.firstName} ${employee.user.lastName}`,
            position: employee.position,
            manager: `${manager.user.firstName} ${manager.user.lastName}`,
            directReports: employees.filter((emp) => emp.managerId === employee.id).length,
          });
        } else {
          hierarchy.bottomLevel.push({
            id: employee.id,
            name: `${employee.user.firstName} ${employee.user.lastName}`,
            position: employee.position,
            manager: manager ? `${manager.user.firstName} ${manager.user.lastName}` : 'Unknown',
          });
        }
      }
    }

    return hierarchy;
  }
}
