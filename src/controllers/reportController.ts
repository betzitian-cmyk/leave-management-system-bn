// filepath: src/controllers/reportController.ts
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { LeaveRequest, Employee, Department, LeaveType } from '../models';

export class ReportController {
  async getLeaveByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { year, month } = req.query;
      const currentYear = year ? Number(year) : new Date().getFullYear();
      const currentMonth = month ? Number(month) : null;

      let dateFilter: any = {
        startDate: new Date(`${currentYear}-01-01`),
        endDate: new Date(`${currentYear}-12-31`),
      };

      if (currentMonth) {
        const startDate = new Date(currentYear, currentMonth - 1, 1);
        const endDate = new Date(currentYear, currentMonth, 0);
        dateFilter = { startDate, endDate };
      }

      const result = await getRepository(LeaveRequest)
        .createQueryBuilder('lr')
        .select('d.name', 'departmentName')
        .addSelect('COUNT(lr.id)', 'leaveCount')
        .addSelect('SUM(lr.days)', 'totalDays')
        .innerJoin('lr.employee', 'e')
        .innerJoin('e.department', 'd')
        .where('lr.status = :status', { status: 'APPROVED' })
        .andWhere('lr.startDate >= :startDate', { startDate: dateFilter.startDate })
        .andWhere('lr.endDate <= :endDate', { endDate: dateFilter.endDate })
        .groupBy('d.name')
        .getRawMany();

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getLeaveByDepartment:', error);
      res.status(500).json({
        message: 'Failed to generate report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getLeaveByEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const { year } = req.query;
      const currentYear = year ? Number(year) : new Date().getFullYear();

      const result = await getRepository(LeaveRequest)
        .createQueryBuilder('lr')
        .select('lt.name', 'leaveType')
        .addSelect('SUM(lr.days)', 'totalDays')
        .innerJoin('lr.leaveType', 'lt')
        .where('lr.employeeId = :employeeId', { employeeId })
        .andWhere('lr.status = :status', { status: 'APPROVED' })
        .andWhere('EXTRACT(YEAR FROM lr.startDate) = :year', { year: currentYear })
        .groupBy('lt.name')
        .getRawMany();

      const employeeData = await getRepository(Employee)
        .createQueryBuilder('e')
        .innerJoin('e.user', 'u')
        .select('u.firstName', 'firstName')
        .addSelect('u.lastName', 'lastName')
        .where('e.id = :employeeId', { employeeId })
        .getRawOne();

      res.status(200).json({
        employee: employeeData,
        leaveData: result,
      });
    } catch (error) {
      console.error('Error in getLeaveByEmployee:', error);
      res.status(500).json({
        message: 'Failed to generate report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getLeaveByType(req: Request, res: Response): Promise<void> {
    try {
      const { year } = req.query;
      const currentYear = year ? Number(year) : new Date().getFullYear();

      const result = await getRepository(LeaveRequest)
        .createQueryBuilder('lr')
        .select('lt.name', 'leaveType')
        .addSelect('COUNT(lr.id)', 'leaveCount')
        .addSelect('SUM(lr.days)', 'totalDays')
        .innerJoin('lr.leaveType', 'lt')
        .where('lr.status = :status', { status: 'APPROVED' })
        .andWhere('EXTRACT(YEAR FROM lr.startDate) = :year', { year: currentYear })
        .groupBy('lt.name')
        .getRawMany();

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getLeaveByType:', error);
      res.status(500).json({
        message: 'Failed to generate report',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getLeaveCalendar(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId, month, year } = req.query;
      const currentYear = year ? Number(year) : new Date().getFullYear();
      const currentMonth = month ? Number(month) : new Date().getMonth() + 1;

      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);

      let query = getRepository(LeaveRequest)
        .createQueryBuilder('lr')
        .innerJoin('lr.employee', 'e')
        .innerJoin('e.user', 'u')
        .innerJoin('lr.leaveType', 'lt')
        .innerJoin('e.department', 'd')
        .select('u.firstName', 'firstName')
        .addSelect('u.lastName', 'lastName')
        .addSelect('u.profilePicture', 'profilePicture')
        .addSelect('lr.startDate', 'startDate')
        .addSelect('lr.endDate', 'endDate')
        .addSelect('lt.name', 'leaveType')
        .addSelect('lt.color', 'color')
        .addSelect('d.name', 'department')
        .where('lr.status = :status', { status: 'APPROVED' })
        .andWhere('(lr.startDate <= :endDate AND lr.endDate >= :startDate)', {
          startDate,
          endDate,
        });

      if (departmentId) {
        query = query.andWhere('e.departmentId = :departmentId', { departmentId });
      }

      const result = await query.getRawMany();

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getLeaveCalendar:', error);
      res.status(500).json({
        message: 'Failed to generate calendar data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async exportToCsv(req: Request, res: Response): Promise<void> {
    try {
      const { reportType, departmentId, year, month } = req.query;

      // Implementation depends on the CSV library you choose
      // This is a placeholder that should be replaced with actual CSV generation logic

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="report-${reportType}-${year}-${month}.csv"`,
      );

      // Generate and send CSV data
      res.send('CSV data would be here');
    } catch (error) {
      res.status(500).json({ message: 'Failed to export report to CSV', error });
    }
  }

  async exportToExcel(req: Request, res: Response): Promise<void> {
    try {
      const { reportType, departmentId, year, month } = req.query;

      // Implementation depends on the Excel library you choose
      // This is a placeholder that should be replaced with actual Excel generation logic

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="report-${reportType}-${year}-${month}.xlsx"`,
      );

      // Generate and send Excel data
      res.send('Excel data would be here');
    } catch (error) {
      res.status(500).json({ message: 'Failed to export report to Excel', error });
    }
  }
}
