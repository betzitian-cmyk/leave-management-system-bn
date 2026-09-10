import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { ManagerService } from '../services/managerService';
import { Employee } from '../models';

export class ManagerController {
  private managerService = new ManagerService();

  async getTeamMembers(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      // Get employee record for the user
      const employeeRepository = getRepository(Employee);
      const employee = await employeeRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!employee) {
        res.status(404).json({ error: 'Employee record not found for this user' });
        return;
      }

      const includeInactive = req.query.includeInactive === 'true';
      const teamMembers = await this.managerService.getTeamMembers(employee.id, true);

      // Filter out inactive employees if not requested (based on Employee status)
      const filteredMembers = includeInactive
        ? teamMembers
        : teamMembers.filter((member) => member.status === 'ACTIVE');

      res.status(200).json({
        success: true,
        data: filteredMembers,
        message: 'Team members retrieved successfully',
      });
    } catch (error: any) {
      console.error('Error getting team members:', error);
      res.status(500).json({ error: error.message || 'Failed to retrieve team members' });
    }
  }

  async getTeamLeaves(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      // TODO: Implement team leaves functionality
      res.status(200).json({ message: 'Team leaves not implemented yet' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTeamPerformance(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      // TODO: Implement team performance functionality
      res.status(200).json({ message: 'Team performance not implemented yet' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async approveLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      // TODO: Implement leave approval functionality
      res.status(200).json({ message: 'Leave request approved successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async rejectLeaveRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      // TODO: Implement leave rejection functionality
      res.status(200).json({ message: 'Leave request rejected successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTeamCalendar(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      // TODO: Implement team calendar functionality
      res.status(200).json({ message: 'Team calendar not implemented yet' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
