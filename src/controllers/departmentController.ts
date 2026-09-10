import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Department } from '../models/Department';
import { Employee } from '../models/Employee';

export class DepartmentController {
  async getAllDepartments(req: Request, res: Response): Promise<void> {
    try {
      const departmentRepository = getRepository(Department);
      const departments = await departmentRepository.find({
        relations: ['manager', 'manager.user', 'employees', 'employees.user'],
      });

      res.status(200).json(departments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve departments', error });
    }
  }

  async getDepartmentById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const departmentRepository = getRepository(Department);

      const department = await departmentRepository.findOne({
        where: { id },
        relations: ['manager', 'employees'],
      });

      if (!department) {
        res.status(404).json({ message: 'Department not found' });
        return;
      }

      res.status(200).json(department);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve department', error });
    }
  }

  async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, managerId } = req.body;

      const departmentRepository = getRepository(Department);

      // Check if department name is already taken
      const existingDepartment = await departmentRepository.findOne({ where: { name } });

      if (existingDepartment) {
        res.status(400).json({ message: 'Department with this name already exists' });
        return;
      }

      // Verify manager exists if provided
      if (managerId) {
        const employeeRepository = getRepository(Employee);
        const manager = await employeeRepository.findOne({ where: { id: managerId } });

        if (!manager) {
          res.status(400).json({ message: 'Manager not found' });
          return;
        }
      }

      const newDepartment = departmentRepository.create({
        name,
        description,
        managerId,
      });

      const savedDepartment = await departmentRepository.save(newDepartment);

      res.status(201).json(savedDepartment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create department', error });
    }
  }

  async updateDepartment(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { name, description, managerId } = req.body;

      const departmentRepository = getRepository(Department);
      const department = await departmentRepository.findOne({ where: { id } });

      if (!department) {
        res.status(404).json({ message: 'Department not found' });
        return;
      }

      // Check for unique name constraint if name is being changed
      if (name && name !== department.name) {
        const existingDepartment = await departmentRepository.findOne({ where: { name } });

        if (existingDepartment) {
          res.status(400).json({ message: 'Department with this name already exists' });
          return;
        }
      }

      // Verify manager exists if provided
      if (managerId && managerId !== department.managerId) {
        const employeeRepository = getRepository(Employee);
        const manager = await employeeRepository.findOne({ where: { id: managerId } });

        if (!manager) {
          res.status(400).json({ message: 'Manager not found' });
          return;
        }
      }

      // Update department
      if (name) department.name = name;
      if (description !== undefined) department.description = description;
      if (managerId !== undefined) department.managerId = managerId;

      const updatedDepartment = await departmentRepository.save(department);

      res.status(200).json(updatedDepartment);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update department', error });
    }
  }

  async deleteDepartment(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const departmentRepository = getRepository(Department);
      const employeeRepository = getRepository(Employee);

      // Check if department exists
      const department = await departmentRepository.findOne({ where: { id } });

      if (!department) {
        res.status(404).json({ message: 'Department not found' });
        return;
      }

      // Check if there are employees in this department
      const employeeCount = await employeeRepository.count({ where: { departmentId: id } });

      if (employeeCount > 0) {
        res.status(400).json({
          message: 'Cannot delete department with employees. Reassign employees first.',
        });
        return;
      }

      await departmentRepository.remove(department);

      res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete department', error });
    }
  }
}
