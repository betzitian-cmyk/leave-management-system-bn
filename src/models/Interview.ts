import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobApplication } from './JobApplication';
import { Employee } from './Employee';

export enum InterviewType {
  PHONE_SCREEN = 'PHONE_SCREEN',
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  FINAL = 'FINAL',
  PANEL = 'PANEL',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export enum InterviewResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  NEEDS_FOLLOW_UP = 'NEEDS_FOLLOW_UP',
  ON_HOLD = 'ON_HOLD',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  applicationId!: string;

  @ManyToOne(() => JobApplication, (application) => application.interviews)
  @JoinColumn({ name: 'application_id' })
  application!: JobApplication;

  @Column({
    type: 'enum',
    enum: InterviewType,
    default: InterviewType.TECHNICAL,
  })
  type!: InterviewType;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status!: InterviewStatus;

  @Column({ type: 'timestamp' })
  scheduledAt!: Date;

  @Column({ type: 'int', default: 60 })
  duration!: number; // Duration in minutes

  @Column({ nullable: true })
  location!: string;

  @Column({ nullable: true })
  meetingLink!: string; // For virtual interviews

  @Column({ nullable: true })
  notes!: string;

  @Column({ type: 'text', array: true, default: [] })
  interviewers!: string[]; // Array of employee IDs

  @Column({ nullable: true })
  primaryInterviewerId!: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'primary_interviewer_id' })
  primaryInterviewer!: Employee;

  @Column({ type: 'text', nullable: true })
  feedback!: string;

  @Column({
    type: 'enum',
    enum: InterviewResult,
    nullable: true,
  })
  result!: InterviewResult;

  @Column({ type: 'int', nullable: true })
  rating!: number; // 1-5 rating

  @Column({ type: 'text', array: true, default: [] })
  strengths!: string[];

  @Column({ type: 'text', array: true, default: [] })
  weaknesses!: string[];

  @Column({ type: 'text', nullable: true })
  recommendations!: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt!: Date;

  @Column({ nullable: true, name: 'cancelled_by' })
  cancelledById?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'cancelled_by' })
  cancelledBy?: Employee;

  @Column({ type: 'text', nullable: true })
  cancellationReason!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
