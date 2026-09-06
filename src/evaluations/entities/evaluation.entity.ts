import { Subject } from 'src/subjects/entities/subject.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const numericTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null | undefined) =>
    value !== null && value !== undefined ? Number(value) : value,
};

@Entity()
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Percentage weight between 1% and 100%
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  weight: number;

  // Score/grade between 0.0 and 5.0
  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    transformer: numericTransformer,
  })
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Automatic cascade deletion when the subject is deleted
  @ManyToOne(() => Subject, (subject) => subject.evaluations, {
    onDelete: 'CASCADE',
  })
  subject: Subject;
}
