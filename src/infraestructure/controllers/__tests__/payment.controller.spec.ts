import { Test, TestingModule } from '@nestjs/testing';
import { CreatePaymentUseCase } from '../../../application/usecases/payment/create-payment.usecase';
import { FilterPaymentUseCase } from '../../../application/usecases/payment/filter-payment.usecase';
import { FindPaymentUseCase } from '../../../application/usecases/payment/find-payment.usecase';
import { ProcessWebhookUseCase } from '../../../application/usecases/payment/process-webhook.usecase';
import { UpdatePaymentUseCase } from '../../../application/usecases/payment/update-payment.usecase';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../../domain/entities/payment.entity';
import { PaymentController } from '../payment/payment.controller';

// Mocks for all use cases
const mockCreatePaymentUseCase = { execute: jest.fn() };
const mockFilterPaymentUseCase = { execute: jest.fn() };
const mockFindPaymentUseCase = { execute: jest.fn() };
const mockProcessWebhookUseCase = { execute: jest.fn() };
const mockUpdatePaymentUseCase = { execute: jest.fn() };

describe('PaymentController', () => {
  let controller: PaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: CreatePaymentUseCase, useValue: mockCreatePaymentUseCase },
        { provide: FilterPaymentUseCase, useValue: mockFilterPaymentUseCase },
        { provide: FindPaymentUseCase, useValue: mockFindPaymentUseCase },
        { provide: ProcessWebhookUseCase, useValue: mockProcessWebhookUseCase },
        { provide: UpdatePaymentUseCase, useValue: mockUpdatePaymentUseCase },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    jest.clearAllMocks();
  });

  describe('POST / (create)', () => {
    it('should call CreatePaymentUseCase with the correct DTO', async () => {
      const dto = {
        cpf: '111.111.111-11',
        amount: 100,
        description: 'Test',
        paymentMethod: PaymentMethod.PIX,
      };
      mockCreatePaymentUseCase.execute.mockResolvedValue({
        id: '1',
        status: 'PENDING',
      });

      await controller.create(dto);

      expect(mockCreatePaymentUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('GET / (filter)', () => {
    it('should call FilterPaymentUseCase with query params', async () => {
      const dto = { cpf: '111.111.111-11' };
      mockFilterPaymentUseCase.execute.mockResolvedValue([]);

      await controller.filter(dto);

      expect(mockFilterPaymentUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('GET /:id (findById)', () => {
    it('should call FindPaymentUseCase with the correct id', async () => {
      const params = { id: 'test-id' };
      mockFindPaymentUseCase.execute.mockResolvedValue({
        id: 'test-id',
        status: PaymentStatus.PENDING,
        amount: { value: 100 },
        cpf: { value: '111' },
        description: 'test',
        paymentMethod: PaymentMethod.PIX,
        createdAt: new Date(),
      });

      await controller.findById(params);

      expect(mockFindPaymentUseCase.execute).toHaveBeenCalledWith({
        id: 'test-id',
      });
    });
  });

  describe('PUT /:id (update)', () => {
    it('should call UpdatePaymentUseCase with id and dto', async () => {
      const params = { id: 'test-id' };
      const dto = { status: PaymentStatus.PAID };
      mockUpdatePaymentUseCase.execute.mockResolvedValue({} as any);

      await controller.update(params, dto);

      expect(mockUpdatePaymentUseCase.execute).toHaveBeenCalledWith({
        id: 'test-id',
        ...dto,
      });
    });
  });

  describe('POST /webhook', () => {
    it('should call ProcessWebhookUseCase with the webhook DTO', async () => {
      const dto = { type: 'payment', data: { id: '123' } };
      mockProcessWebhookUseCase.execute.mockResolvedValue(undefined);

      await controller.webhook(dto);

      expect(mockProcessWebhookUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });
});
