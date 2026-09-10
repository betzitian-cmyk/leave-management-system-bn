import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';

export enum SalaryType {
  BASE_SALARY = 'BASE_SALARY',
  HOURLY_RATE = 'HOURLY_RATE',
  COMMISSION = 'COMMISSION',
  BONUS = 'BONUS',
  ALLOWANCE = 'ALLOWANCE',
}

export enum PayFrequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
}

@Entity('salaries')
export class Salary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.salaries)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({
    type: 'enum',
    enum: SalaryType,
    default: SalaryType.BASE_SALARY,
  })
  type!: SalaryType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: PayFrequency,
    default: PayFrequency.MONTHLY,
  })
  payFrequency!: PayFrequency;

  @Column({ type: 'date' })
  effectiveDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate!: Date;

  @Column({ type: 'text', nullable: true })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ nullable: true })
  approvedBy!: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt!: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentageIncrease!: number; // For salary increases

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  previousAmount!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
