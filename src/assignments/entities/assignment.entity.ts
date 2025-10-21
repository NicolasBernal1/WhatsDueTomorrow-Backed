import { Subject } from "src/subjects/entities/subject.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'timestamp'})
  dueDate: Date;

  @ManyToOne(() => User, user => user.assignments, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Subject, subject => subject.assignments, { onDelete: 'CASCADE', eager: true })
  subject: Subject;
}