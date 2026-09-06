import { Subject } from 'src/subjects/entities/subject.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  linkUrl?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // RNF08: Automatic cascade deletion when the subject is deleted
  @ManyToOne(() => Subject, (subject) => subject.notes, { onDelete: 'CASCADE' })
  subject: Subject;
}
