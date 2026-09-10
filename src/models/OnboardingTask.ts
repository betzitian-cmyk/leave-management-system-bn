import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Onboarding } from './Onboarding';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  ON_HOLD = 'ON_HOLD',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskCategory {
  DOCUMENTATION = 'DOCUMENTATION',
  TRAINING = 'TRAINING',
  EQUIPMENT = 'EQUIPMENT',
  ACCESS = 'ACCESS',
  ORIENTATION = 'ORIENTATION',
  COMPLIANCE = 'COMPLIANCE',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER',
}

@Entity('onboarding_tasks')
export class OnboardingTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  onboardingId!: string;

  @ManyToOne(() => Onboarding, (onboarding) => onboarding.tasks)
  @JoinColumn({ name: 'onboarding_id' })
  onboarding!: Onboarding;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: TaskCategory,
    default: TaskCategory.OTHER,
  })
  category!: TaskCategory;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @Column({ type: 'int', default: 1 })
  orderIndex!: number; // Order in the sequence

  @Column({ type: 'date', nullable: true })
  dueDate!: Date;

  @Column({ type: 'date', nullable: true })
  completedDate!: Date;

  @Column({ nullable: true })
  assignedTo!: string; // Who is responsible for this task

  @Column({ nullable: true })
  completedBy!: string; // Who completed the task

  @Column({ type: 'text', nullable: true })
  instructions!: string; // Step-by-step instructions

  @Column({ type: 'text', array: true, default: [] })
  requiredDocuments!: string[]; // Documents needed for completion

  @Column({ type: 'text', array: true, default: [] })
  attachments!: string[]; // URLs to completed documents

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'text', nullable: true })
  completionNotes!: string; // Notes when task is completed

  @Column({ type: 'boolean', default: false })
  isRequired!: boolean; // Whether this task is mandatory

  @Column({ type: 'boolean', default: false })
  isRecurring!: boolean; // Whether this task repeats for different employees

  @Column({ type: 'int', nullable: true })
  estimatedDuration!: number; // Estimated time in minutes

  @Column({ type: 'int', nullable: true })
  actualDuration!: number; // Actual time taken in minutes

  @Column({ type: 'text', array: true, default: [] })
  dependencies!: string[]; // IDs of tasks that must be completed first

  @Column({ type: 'text', nullable: true })
  failureReason!: string; // Reason if task failed or was skipped

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
