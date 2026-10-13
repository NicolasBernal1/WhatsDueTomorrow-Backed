import '../../src/common/fluent-assertions';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsModule } from '../../src/assignments/assignments.module';
import { AuthModule } from '../../src/auth/auth.module';
import { EvaluationsModule } from '../../src/evaluations/evaluations.module';
import { NotesModule } from '../../src/notes/notes.module';
import { SubjectsModule } from '../../src/subjects/subjects.module';
import { SubtasksModule } from '../../src/subtasks/subtasks.module';
import { UsersModule } from '../../src/users/users.module';

export const JWT_SECRET_E2E = 'e2e-secret';

export async function createE2EApp(): Promise<INestApplication> {
  process.env.JWT_SECRET = JWT_SECRET_E2E;

  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
      TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        autoLoadEntities: true,
        synchronize: true,
      }),
      UsersModule,
      AuthModule,
      SubjectsModule,
      AssignmentsModule,
      SubtasksModule,
      NotesModule,
      EvaluationsModule,
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}