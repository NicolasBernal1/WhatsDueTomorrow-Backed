import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Subject } from "./subject.entity";

@Entity()
export class SubjectClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayOfWeek: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @ManyToOne(() => Subject, subject => subject.subjectClasses, { onDelete: 'CASCADE', eager: true })
  subject: Subject;
}