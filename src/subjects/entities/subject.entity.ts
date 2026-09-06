import { Assignment } from 'src/assignments/entities/assignment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SubjectClass } from './subject-class.entity';
import { Note } from 'src/notes/entities/note.entity';
import { Evaluation } from 'src/evaluations/entities/evaluation.entity';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  professor: string;

  @Column({ default: '#007bff' }) // mirar mejor luego al hacer el front
  color: string;

  @ManyToOne(() => User, (user) => user.subjects, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @OneToMany(() => Assignment, (assignment) => assignment.subject)
  assignments: Assignment[];

  @OneToMany(() => SubjectClass, (subjectClass) => subjectClass.subject, {
    onDelete: 'CASCADE',
  })
  subjectClasses: SubjectClass[];

  @OneToMany(() => Note, (note) => note.subject, { onDelete: 'CASCADE' })
  notes: Note[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.subject, {
    onDelete: 'CASCADE',
  })
  evaluations: Evaluation[];
}
