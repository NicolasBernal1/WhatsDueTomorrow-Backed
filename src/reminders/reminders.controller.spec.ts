import { Test, TestingModule } from '@nestjs/testing';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { Should } from '../common/fluent-assertions';

const mockRemindersService = {
  sendDueTomorrowReminders: jest.fn(),
};

describe('RemindersController', () => {
  let controller: RemindersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemindersController],
      providers: [{ provide: RemindersService, useValue: mockRemindersService }],
    }).compile();

    controller = module.get<RemindersController>(RemindersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    controller.Should().NotBeNull().And.BeDefined();
  });

  it('should delegate to RemindersService.sendDueTomorrowReminders', async () => {
    mockRemindersService.sendDueTomorrowReminders.mockResolvedValue({
      status: 200,
      message: 'Due-tomorrow reminders processed',
    });

    const result = await controller.trigger();

    Should(mockRemindersService.sendDueTomorrowReminders).HaveBeenCalled();
    result.Should().BeEquivalentTo({ status: 200, message: 'Due-tomorrow reminders processed' });
  });
});
