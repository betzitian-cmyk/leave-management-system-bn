import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Employee } from '../models/Employee';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Department } from '../models/Department';
import { EmailService } from '../services/emailService';

export class EmployeeController {
  private emailService = new EmailService();

  async createEmployeeProfile(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId, // Changed from authUserId to userId
        position,
        departmentId,
        hireDate,
        managerId,
      } = req.body;

      const employeeRepository = getRepository(Employee);
      const userRepository = getRepository(User);
      const roleRepository = getRepository(Role);
      const departmentRepository = getRepository(Department);

      // Check if profile already exists through User relationship
      const existingEmployee = await employeeRepository.findOne({
        where: { user: { id: userId } },
      });

      if (existingEmployee) {
        res.status(400).json({ message: 'Employee profile already exists' });
        return;
      }

      // Get the user first with current role
      const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['role'],
      });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Get department information for email
      const department = await departmentRepository.findOne({
        where: { id: departmentId },
        relations: ['manager', 'manager.user'],
      });
      if (!department) {
        res.status(404).json({ message: 'Department not found' });
        return;
      }

      // Create employee profile - link to user via relationship
      const newEmployee = employeeRepository.create({
        user: user,
        position,
        departmentId,
        hireDate: hireDate || new Date(),
        managerId,
      });

      const savedEmployee = await employeeRepository.save(newEmployee);

      // Update user role from GUEST to EMPLOYEE
      const employeeRole = await roleRepository.findOne({
        where: { name: 'EMPLOYEE' },
      });

      if (employeeRole && user.role?.name === 'GUEST') {
        user.role = employeeRole;
        user.roleId = employeeRole.id;
        await userRepository.save(user);

        // Prepare employee data for email
        const managerUser = managerId && department.manager?.user ? department.manager.user : null;
        const employeeData = {
          departmentName: department.name,
          position,
          hireDate: (hireDate || new Date()).toLocaleDateString(),
          employeeId: savedEmployee.id,
          managerName: managerUser ? `${managerUser.firstName} ${managerUser.lastName}` : undefined,
          managerEmail: managerUser?.email || undefined,
        };

        // Send employee assignment notification email
        try {
          await this.emailService.sendEmployeeAssignmentEmail(user, employeeData);
          console.info(`Employee assignment email sent to: ${user.email}`);
        } catch (emailError) {
          console.error('Failed to send employee assignment email:', emailError);
          // Don't fail the operation if email fails
        }

        res.status(201).json({
          success: true,
          message:
            'Employee profile created successfully. User role updated to EMPLOYEE and notification sent.',
          data: {
            employee: savedEmployee,
            roleChanged: true,
            emailSent: true,
          },
        });
      } else {
        res.status(201).json({
          success: true,
          message: 'Employee profile created successfully.',
          data: {
            employee: savedEmployee,
            roleChanged: false,
            emailSent: false,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to create employee profile', error });
    }
  }

  async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      // This endpoint is only for HR/Admin - no role checks needed (handled by route authorization)
      const employeeRepository = getRepository(Employee);

      // Get query parameters for filtering and pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const searchTerm = req.query.search as string;
      const departmentId = req.query.departmentId as string;
      const position = req.query.position as string;
      const status = req.query.status as string;

      let query = employeeRepository
        .createQueryBuilder('emp')
        .leftJoinAndSelect('emp.department', 'dept')
        .leftJoinAndSelect('emp.user', 'user')
        .leftJoinAndSelect('emp.manager', 'manager');

      // Apply filters
      if (departmentId) {
        query = query.andWhere('emp.departmentId = :departmentId', { departmentId });
      }

      if (position) {
        query = query.andWhere('emp.position ILIKE :position', { position: `%${position}%` });
      }

      if (status) {
        query = query.andWhere('emp.status = :status', { status });
      }

      if (searchTerm) {
        query = query.andWhere(
          '(user.firstName ILIKE :searchTerm OR user.lastName ILIKE :searchTerm OR user.email ILIKE :searchTerm OR emp.position ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` },
        );
      }

      // No role filtering needed - route authorization handles access control

      // Get total count for pagination
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by name
      query = query.orderBy('user.firstName', 'ASC').addOrderBy('user.lastName', 'ASC');

      const employees = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: employees,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve employees',
        error: error.message,
      });
    }
  }

  async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user.id;

      const employeeRepository = getRepository(Employee);

      // Get the current employee through user relationship
      const currentEmployee = await employeeRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!currentEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Get the requested employee
      const employee = await employeeRepository.findOne({
        where: { id },
        relations: ['department', 'manager'],
      });

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Access control:
      // HR/Admin have full access (handled by route authorization)
      // Others can view: themselves or same department
      const userRole = (req as any).user?.role || '';
      const hasFullAccess = userRole === 'HR_MANAGER' || userRole === 'ADMIN';
      const canView =
        hasFullAccess ||
        employee.id === currentEmployee.id ||
        employee.departmentId === currentEmployee.departmentId;

      if (canView) {
        res.status(200).json(employee);
      } else {
        res.status(403).json({ message: 'Access denied' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve employee', error });
    }
  }

  async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const employeeRepository = getRepository(Employee);

      const employee = await employeeRepository.findOne({ where: { id } });

      if (!employee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Update employee with provided fields
      employeeRepository.merge(employee, req.body);

      const updatedEmployee = await employeeRepository.save(employee);

      res.status(200).json(updatedEmployee);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update employee', error });
    }
  }

  async getMyDepartmentEmployees(req: Request, res: Response): Promise<void> {
    try {
      // This endpoint is only for Managers - get employees in their department
      const userId = (req as any).user.id;
      const employeeRepository = getRepository(Employee);

      // Get current manager's information
      const currentEmployee = await employeeRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!currentEmployee) {
        res.status(404).json({ message: 'Employee not found' });
        return;
      }

      // Get query parameters for filtering and pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const searchTerm = req.query.search as string;
      const position = req.query.position as string;
      const status = req.query.status as string;

      let query = employeeRepository
        .createQueryBuilder('emp')
        .leftJoinAndSelect('emp.department', 'dept')
        .leftJoinAndSelect('emp.user', 'user')
        .leftJoinAndSelect('emp.manager', 'manager')
        .where('emp.departmentId = :departmentId', { departmentId: currentEmployee.departmentId });

      // Apply filters
      if (position) {
        query = query.andWhere('emp.position ILIKE :position', { position: `%${position}%` });
      }

      if (status) {
        query = query.andWhere('emp.status = :status', { status });
      }

      if (searchTerm) {
        query = query.andWhere(
          '(user.firstName ILIKE :searchTerm OR user.lastName ILIKE :searchTerm OR user.email ILIKE :searchTerm OR emp.position ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` },
        );
      }

      // Get total count for pagination
      const total = await query.getCount();

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.skip(offset).take(limit);

      // Order by name
      query = query.orderBy('user.firstName', 'ASC').addOrderBy('user.lastName', 'ASC');

      const employees = await query.getMany();
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: employees,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve department employees', error });
    }
  }
}
