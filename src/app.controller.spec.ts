import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import type { Response } from 'express';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return HTML', () => {
      const mockRes = {
        type: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      appController.getHello(mockRes);
      expect(mockRes.type).toHaveBeenCalledWith('text/html');
      expect(mockRes.send).toHaveBeenCalled();
    });
  });
});
