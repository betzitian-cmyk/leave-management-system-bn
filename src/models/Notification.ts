// src/models/Notification.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';

export type NotificationType =
  | 'LEAVE_SUBMITTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'LEAVE_REMINDER'
  | 'APPROVAL_PENDING'
  | 'LEAVE_CANCELLED';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'recipient_id' })
  recipientId!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'recipient_id' })
  recipient!: Employee;

  @Column()
  title!: string;

  @Column()
  message!: string;

  @Column({ name: 'related_entity_id', nullable: true })
  relatedEntityId!: string;

  @Column({ name: 'entity_type', nullable: true })
  entityType!: string;

  @Column({
    type: 'enum',
    enum: [
      'LEAVE_SUBMITTED',
      'LEAVE_APPROVED',
      'LEAVE_REJECTED',
      'LEAVE_REMINDER',
      'APPROVAL_PENDING',
      'LEAVE_CANCELLED',
    ],
  })
  type!: NotificationType;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
