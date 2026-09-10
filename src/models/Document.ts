// src/models/Document.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { LeaveRequest } from './LeaveRequest';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'leave_request_id' })
  leaveRequestId!: string;

  @ManyToOne(() => LeaveRequest, (leaveRequest) => leaveRequest.documents)
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest!: LeaveRequest;

  // Cloudinary public ID (for deletion operations)
  @Column({ name: 'cloudinary_public_id' })
  cloudinaryPublicId!: string;

  // Cloudinary URL for accessing the file
  @Column({ name: 'cloudinary_url' })
  cloudinaryUrl!: string;

  @Column({ name: 'uploaded_by_id' })
  uploadedById!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
