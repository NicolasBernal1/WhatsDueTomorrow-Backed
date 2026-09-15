import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let assignmentService: jest.Mocked<AssignmentsService>;

  beforeEach(async () => {
    const assignmentServiceMock = {
      getAssignmentsByUser: jest.fn(),
      getUpcomingAssignments: jest.fn(),
      getAssignmentsBySubject: jest.fn(),
      addAssignment: jest.fn(),
      deleteAssignment: jest.fn(),
      editAssignment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [{ provide: AssignmentsService, useValue: assignmentServiceMock }],
    }).compile();

    controller = module.get<AssignmentsController>(AssignmentsController);
    assignmentService = module.get(AssignmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should call assignmentService.getAssignmentsByUser with req.user.sub', async () => {
      const req = { user: { sub: 1 } };
      const expected = { status: 200, message: 'ok', data: [] };
      assignmentService.getAssignmentsByUser.mockResolvedValue(expected as any);

      const result = await controller.getAll(req);

      expect(assignmentService.getAssignmentsByUser).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  // ─── F21: getUpcoming (AssignmentsController) ───────────────────────────
  describe('F21 — getUpcoming', () => {
    it('should extract req.user.sub and return upcoming assignments from service', async () => {
      // Arrange
      const req = { user: { sub: 42 } };
      const expected = {
        status: 200,
        message: 'Upcoming assignments retrieved successfully',
        data: [{ id: 1, title: 'Exam', description: '', dueDate: '2026-09-15T00:00:00Z', subjectId: 2, subjectName: 'Physics' }],
      };
      assignmentService.getUpcomingAssignments.mockResolvedValue(expected as any);

      // Act
      const result = await controller.getUpcoming(req);

      // Assert
      expect(assignmentService.getUpcomingAssignments).toHaveBeenCalledWith(42);
      expect(result).toBe(expected);
    });

    it('should propagate service errors when upcoming assignments retrieval fails', async () => {
      // Arrange
      const req = { user: { sub: 42 } };
      assignmentService.getUpcomingAssignments.mockRejectedValue(new Error('Internal database failure'));

      // Act & Assert
      await expect(controller.getUpcoming(req)).rejects.toThrow('Internal database failure');
    });
  });

  describe('getAssignmentsBySubject', () => {
    it('should call assignmentService.getAssignmentsBySubject with userId and subjectId', async () => {
      const req = { user: { sub: 1 } };
      const expected = { status: 200, message: 'ok', data: [] };
      assignmentService.getAssignmentsBySubject.mockResolvedValue(expected as any);

      const result = await controller.getAssignmentsBySubject(req, 10);

      expect(assignmentService.getAssignmentsBySubject).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(expected);
    });
  });

  describe('addAssignment', () => {
    it('should call assignmentService.addAssignment with userId, subjectId and the DTO', async () => {
      const req = { user: { sub: 1 } };
      const dto = { title: 'Tarea', description: 'desc', dueDate: '2026-01-01T00:00:00' };
      const expected = { status: 201, message: 'Assignment created successfully' };
      assignmentService.addAssignment.mockResolvedValue(expected as any);

      const result = await controller.addAssignment(req, 10, dto as any);

      expect(assignmentService.addAssignment).toHaveBeenCalledWith(1, 10, dto);
      expect(result).toBe(expected);
    });
  });

  describe('removeAssignment', () => {
    it('should call assignmentService.deleteAssignment with assignmentId', async () => {
      const expected = { status: 200, message: 'Assignment deleted successfully' };
      assignmentService.deleteAssignment.mockResolvedValue(expected as any);

      const result = await controller.removeAssignment(100);

      expect(assignmentService.deleteAssignment).toHaveBeenCalledWith(100);
      expect(result).toBe(expected);
    });
  });

  describe('editAssignment', () => {
    it('should call assignmentService.editAssignment with assignmentId and the DTO', async () => {
      const dto = { title: 'Tarea editada' };
      const expected = { status: 200, message: 'Assignment updated successfully' };
      assignmentService.editAssignment.mockResolvedValue(expected as any);

      const result = await controller.editAssignment(100, dto as any);

      expect(assignmentService.editAssignment).toHaveBeenCalledWith(100, dto);
      expect(result).toBe(expected);
    });
  });
});