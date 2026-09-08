import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Subtask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'int', default: 0 })
  position: number;

  // The database removes the checklist automatically when its assignment is deleted.
  @ManyToOne(() => Assignment, (assignment) => assignment.subtasks, {
    onDelete: 'CASCADE',
  })
  assignment: Assignment;
}
