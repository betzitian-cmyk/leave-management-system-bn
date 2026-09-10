// src/models/Employee.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from './Department';
import { LeaveRequest } from './LeaveRequest';
import { LeaveBalance } from './LeaveBalance';
import { Salary } from './Salary';
import { Bonus } from './Bonus';
import { EmployeeBenefit } from './EmployeeBenefit';
import { Onboarding } from './Onboarding';
import { User } from './User';
import { Attendance } from './Attendance';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // One-to-One relationship with User (employees get their data from users)
  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ default: 'ACTIVE' })
  status!: string;

  @Column()
  position!: string;

  @Column({ name: 'hire_date' })
  hireDate!: Date;

  // Manager relationship - need both column and relationship
  @Column({ name: 'manager_id', nullable: true })
  managerId!: string | null;

  @ManyToOne(() => Employee, (employee) => employee.directReports)
  @JoinColumn({ name: 'manager_id' })
  manager!: Employee;

  @OneToMany(() => Employee, (employee) => employee.manager)
  directReports!: Employee[];

  // Department relationship - need both column and relationship
  @Column({ name: 'department_id' })
  departmentId!: string;

  @ManyToOne(() => Department, (department) => department.employees)
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  // One-to-Many relationships
  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.employee)
  leaveRequests!: LeaveRequest[];

  @OneToMany(() => LeaveBalance, (leaveBalance) => leaveBalance.employee)
  leaveBalances!: LeaveBalance[];

  @OneToMany(() => Salary, (salary) => salary.employee)
  salaries!: Salary[];

  @OneToMany(() => Bonus, (bonus) => bonus.employee)
  bonuses!: Bonus[];

  @OneToMany(() => EmployeeBenefit, (employeeBenefit) => employeeBenefit.employee)
  employeeBenefits!: EmployeeBenefit[];

  @OneToMany(() => Onboarding, (onboarding) => onboarding.employee)
  onboardings!: Onboarding[];

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendances!: Attendance[];

  // Fingerprint biometric data
  @Column({ name: 'fingerprint_template', nullable: true, type: 'text' })
  fingerprintTemplate?: string; // Base64 encoded fingerprint template

  @Column({ name: 'fingerprint_enrolled', default: false })
  fingerprintEnrolled!: boolean; // Whether fingerprint is enrolled

  @Column({ name: 'enrollment_date', nullable: true })
  enrollmentDate?: Date; // When fingerprint was enrolled

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
