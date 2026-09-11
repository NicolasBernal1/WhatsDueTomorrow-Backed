import { Subject } from 'src/subjects/entities/subject.entity';
import { User } from 'src/users/entities/user.entity';
import { Subtask } from 'src/subtasks/entities/subtask.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'datetime' })
  dueDate: string;

  // Minutes before the deadline at which the browser notification is scheduled.
  @Column({ type: 'int', nullable: true })
  reminderMinutes?: number | null;

  @ManyToOne(() => User, (user) => user.assignments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Subject, (subject) => subject.assignments, {
    onDelete: 'CASCADE',
    eager: true,
  })
  subject: Subject;

  @OneToMany(() => Subtask, (subtask) => subtask.assignment)
  subtasks: Subtask[];
}
