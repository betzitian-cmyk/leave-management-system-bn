import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';
import { OnboardingTask } from './OnboardingTask';

export enum OnboardingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum OnboardingPhase {
  PRE_BOARDING = 'PRE_BOARDING',
  FIRST_DAY = 'FIRST_DAY',
  FIRST_WEEK = 'FIRST_WEEK',
  FIRST_MONTH = 'FIRST_MONTH',
  FIRST_QUARTER = 'FIRST_QUARTER',
}

@Entity('onboardings')
export class Onboarding {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  employeeId!: string;

  @ManyToOne(() => Employee, (employee) => employee.onboardings)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({
    type: 'enum',
    enum: OnboardingStatus,
    default: OnboardingStatus.NOT_STARTED,
  })
  status!: OnboardingStatus;

  @Column({
    type: 'enum',
    enum: OnboardingPhase,
    default: OnboardingPhase.PRE_BOARDING,
  })
  currentPhase!: OnboardingPhase;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true })
  targetCompletionDate!: Date;

  @Column({ type: 'date', nullable: true })
  actualCompletionDate!: Date;

  @Column({ nullable: true, name: 'assigned_to' })
  assignedToId?: string; // HR Manager or Buddy assigned

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo?: Employee;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'text', array: true, default: [] })
  goals!: string[]; // Onboarding goals and objectives

  @Column({ type: 'text', array: true, default: [] })
  challenges!: string[]; // Challenges encountered during onboarding

  @Column({ type: 'text', nullable: true })
  feedback!: string; // Employee feedback about onboarding process

  @Column({ type: 'int', nullable: true })
  satisfactionRating!: number; // 1-5 rating

  @Column({ type: 'text', nullable: true })
  improvementSuggestions!: string;

  @Column({ type: 'boolean', default: false })
  isTemplate!: boolean; // Whether this is a template for future onboardings

  @Column({ nullable: true })
  templateName!: string;

  @Column({ type: 'text', array: true, default: [] })
  customFields!: string[]; // Additional custom fields for specific roles

  @OneToMany(() => OnboardingTask, (task) => task.onboarding)
  tasks!: OnboardingTask[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
