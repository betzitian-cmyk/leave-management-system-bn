// filepath: src/controllers/leaveTypeController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { LeaveType } from '../models';

export class LeaveTypeController {
  async getAllLeaveTypes(req: Request, res: Response): Promise<void> {
    try {
      const leaveTypeRepository = getRepository(LeaveType);
      const leaveTypes = await leaveTypeRepository.find({ where: { active: true } });
      res.status(200).json(leaveTypes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave types', error });
    }
  }

  async getLeaveTypeById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const leaveTypeRepository = getRepository(LeaveType);
      const leaveType = await leaveTypeRepository.findOne({ where: { id } });

      if (!leaveType) {
        res.status(404).json({ message: 'Leave type not found' });
        return;
      }

      res.status(200).json(leaveType);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve leave type', error });
    }
  }

  async createLeaveType(req: Request, res: Response): Promise<void> {
    try {
      const leaveTypeRepository = getRepository(LeaveType);
      const newLeaveType = leaveTypeRepository.create(req.body);
      const result = await leaveTypeRepository.save(newLeaveType);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create leave type', error });
    }
  }

  async updateLeaveType(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const leaveTypeRepository = getRepository(LeaveType);

      const leaveType = await leaveTypeRepository.findOne({ where: { id } });
      if (!leaveType) {
        res.status(404).json({ message: 'Leave type not found' });
        return;
      }

      leaveTypeRepository.merge(leaveType, req.body);
      const result = await leaveTypeRepository.save(leaveType);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update leave type', error });
    }
  }

  async deleteLeaveType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const leaveTypeRepository = getRepository(LeaveType);

      const result = await leaveTypeRepository.update(id, { active: false });
      if (result.affected === 0) {
        res.status(404).json({ message: 'Leave type not found' });
        return;
      }

      res.status(200).json({ message: 'Leave type deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete leave type', error });
    }
  }
}
