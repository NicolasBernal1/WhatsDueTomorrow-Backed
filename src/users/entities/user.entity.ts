import { Assignment } from "src/assignments/entities/assignment.entity";
import { SubjectClass } from "src/subjects/entities/subject-class.entity";
import { Subject } from "src/subjects/entities/subject.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToMany(() => Subject, (subject) => subject.user)
  subjects: Subject[];

  @OneToMany(() => Assignment, (assignment) => assignment.user)
  assignments: Assignment[];

  @OneToMany(() => SubjectClass, (subjectClass) => subjectClass.user)
  subjectClasses: SubjectClass[];
}